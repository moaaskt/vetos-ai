import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class TutorAuthService {
  private readonly logger = new Logger(TutorAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Solicita um Magic Link via e-mail (SMTP) vinculando o Client ao TutorIdentity se necessário.
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Buscar Clients vinculados ao e-mail informado (seja primário ou alternativo)
    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          { email: cleanEmail },
          { emailAlt: cleanEmail },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (clients.length === 0) {
      // Por segurança contra enumeração de e-mails, retornamos sucesso genérico
      return {
        success: true,
        message: 'Se o e-mail estiver cadastrado, um link de acesso será enviado.',
      };
    }

    // 2. Tentar buscar uma TutorIdentity existente ou criar uma nova
    // Buscamos pelo e-mail
    let tutorIdentity = await this.prisma.tutorIdentity.findUnique({
      where: { primaryEmail: cleanEmail },
    });

    if (!tutorIdentity) {
      // Se não existir, criamos usando o nome do primeiro Client encontrado
      const defaultName = clients[0].name;
      const publicId = `ttr_${crypto.randomBytes(8).toString('hex')}`;
      tutorIdentity = await this.prisma.tutorIdentity.create({
        data: {
          publicId,
          name: defaultName,
          primaryEmail: cleanEmail,
        },
      });
    }

    // 3. Vincular todos os Clients encontrados à TutorIdentity correspondente
    for (const client of clients) {
      if (client.tutorIdentityId !== tutorIdentity.id) {
        await this.prisma.client.update({
          where: { id: client.id },
          data: { tutorIdentityId: tutorIdentity.id },
        });
      }
    }

    // 4. Gerar Magic Link Token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas de validade

    await this.prisma.tutorPortalToken.create({
      data: {
        tokenHash,
        tutorIdentityId: tutorIdentity.id,
        expiresAt,
        requestedBy: 'EMAIL',
      },
    });

    // 5. Disparar notificação via E-mail
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLinkUrl = `${frontendUrl}/tutor/auth/verify?token=${plainToken}`;

    const clinicIdForEmail = clients[0].clinicId;
    this.logger.log(`Enfileirando Magic Link para ${cleanEmail} utilizando o SMTP da clínica ${clinicIdForEmail}`);

    await this.notificationsService.enqueueNotification({
      clinicId: clinicIdForEmail,
      channel: 'EMAIL',
      to: cleanEmail,
      subject: 'Acesso à Plataforma do Tutor - VetOS AI',
      body: `Olá ${tutorIdentity.name},\n\nPara acessar a plataforma do tutor e gerenciar o histórico de seus pets, clique no link abaixo:\n\n${magicLinkUrl}\n\nEste link é válido por 24 horas e de uso único.\n\nAtenciosamente,\nEquipe VetOS AI`,
      htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">VetOS AI</h2>
  <p>Olá, <strong>${tutorIdentity.name}</strong>,</p>
  <p>Acesse a plataforma do tutor para acompanhar a saúde dos seus pets.</p>
  <div style="margin: 30px 0; text-align: center;">
    <a href="${magicLinkUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar Portal do Tutor</a>
  </div>
  <p style="font-size: 0.9em; color: #666; text-align: center;">Este link expira em 24 horas e só pode ser usado uma vez.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 0.8em; color: #999;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
  <a href="${magicLinkUrl}" style="color: #059669;">${magicLinkUrl}</a></p>
</div>`,
      event: 'TUTOR_MAGIC_LINK',
    });

    return {
      success: true,
      message: 'Se o e-mail estiver cadastrado, um link de acesso será enviado.',
    };
  }

  /**
   * Valida o token do Magic Link e emite tokens de sessão (JWT + Refresh Token)
   */
  async verifyMagicLink(plainToken: string, ip?: string, userAgent?: string) {
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    // 1. Buscar token correspondente
    const portalToken = await this.prisma.tutorPortalToken.findUnique({
      where: { tokenHash },
      include: { tutorIdentity: true },
    });

    if (!portalToken) {
      throw new BadRequestException('Link de acesso inválido.');
    }

    if (portalToken.usedAt) {
      throw new BadRequestException('Este link de acesso já foi utilizado.');
    }

    if (portalToken.expiresAt < new Date()) {
      throw new BadRequestException('Este link de acesso expirou.');
    }

    // 2. Marcar token como utilizado
    await this.prisma.tutorPortalToken.update({
      where: { id: portalToken.id },
      data: { usedAt: new Date() },
    });

    // 3. Gerar tokens de sessão
    return this.createTutorSession(portalToken.tutorIdentityId, portalToken.tutorIdentity.publicId);
  }

  /**
   * Renova o Access Token com base em um Refresh Token válido
   */
  async refreshSession(plainRefreshToken: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(plainRefreshToken).digest('hex');

    const session = await this.prisma.tutorSession.findUnique({
      where: { refreshTokenHash },
      include: { tutorIdentity: true },
    });

    if (!session) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Esta sessão foi revogada.');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada.');
    }

    // Atualiza o lastUsedAt da sessão
    await this.prisma.tutorSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    // Gera um novo par de tokens
    return this.createTutorSession(session.tutorIdentityId, session.tutorIdentity.publicId);
  }

  /**
   * Método auxiliar para criar e armazenar TutorSession + gerar JWTs
   */
  private async createTutorSession(tutorIdentityId: string, publicId: string) {
    // 1. Obter escopos (allowed IDs) do Tutor
    const clients = await this.prisma.client.findMany({
      where: { tutorIdentityId },
      include: { pets: true },
    });

    const allowedClientIds = clients.map((c) => c.id);
    const allowedClinicIds = Array.from(new Set(clients.map((c) => c.clinicId)));
    const allowedPetIds = clients.flatMap((c) => c.pets.map((p) => p.id));

    // 2. Gerar Access Token JWT (curto)
    const jwtSecret = process.env.TUTOR_JWT_SECRET || 'super-secret-tutor-dev-key';
    const payload = {
      sub: tutorIdentityId,
      tutorIdentityId,
      publicId,
      allowedClientIds,
      allowedClinicIds,
      allowedPetIds,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    // 3. Gerar Refresh Token
    const plainRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(plainRefreshToken).digest('hex');
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 dias de validade para a sessão

    // Persistir a sessão
    await this.prisma.tutorSession.create({
      data: {
        tutorIdentityId,
        refreshTokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: plainRefreshToken,
      expiresIn: 900, // 15 minutos em segundos
      tutor: {
        id: tutorIdentityId,
        publicId,
      },
    };
  }
}
