import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { CreateConsentTermDto } from './dto/create-consent-term.dto';
import { DocumentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ConsentTermsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Cria um novo template de termo
  async createTemplate(clinicId: string, data: CreateConsentTemplateDto) {
    return this.prisma.consentTemplate.create({
      data: {
        name: data.name,
        procedureType: data.procedureType,
        baseText: data.baseText,
        clinicId,
      },
    });
  }

  // Lista os templates. Se a lista estiver vazia, popula com os 3 modelos padrão.
  async findAllTemplates(clinicId: string) {
    const templates = await this.prisma.consentTemplate.findMany({
      where: { clinicId, isActive: true },
    });

    if (templates.length > 0) {
      return templates;
    }

    // Inicialização dinâmica dos 3 templates padrão
    const defaultTemplates = [
      {
        name: 'Termo de Consentimento para Castração',
        procedureType: 'CASTRACAO',
        baseText: 'Eu, {tutor_name}, autorizo o procedimento de castração no paciente {pet_name} na clínica {clinic_name}.',
      },
      {
        name: 'Termo de Consentimento para Cirurgia Eletiva',
        procedureType: 'CIRURGIA_ELETIVA',
        baseText: 'Eu, {tutor_name}, autorizo a realização da cirurgia eletiva no paciente {pet_name} sob a responsabilidade de {clinic_name}.',
      },
      {
        name: 'Termo de Consentimento para Internação',
        procedureType: 'INTERNACAO',
        baseText: 'Eu, {tutor_name}, autorizo a internação de {pet_name} na clínica {clinic_name} para fins de tratamento clínico.',
      },
    ];

    const created = [];
    for (const t of defaultTemplates) {
      const dbTemplate = await this.prisma.consentTemplate.create({
        data: {
          ...t,
          clinicId,
        },
      });
      created.push(dbTemplate);
    }

    return created;
  }

  // Cria um termo clínico a partir do texto final interpolado
  async create(clinicId: string, data: CreateConsentTermDto) {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: data.petId,
        clinicId,
      },
      include: {
        client: true,
        clinic: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    // Interpolação robusta de placeholders no texto final
    let text = data.finalText;
    text = text
      .replace(/{pet_name}/g, pet.name)
      .replace(/{tutor_name}/g, pet.client.name)
      .replace(/{clinic_name}/g, pet.clinic.name);

    return this.prisma.consentTerm.create({
      data: {
        petId: data.petId,
        clinicId,
        appointmentId: data.appointmentId || null,
        consentTemplateId: data.consentTemplateId || null,
        finalText: text,
        status: DocumentStatus.DRAFT,
      },
    });
  }

  async findOne(clinicId: string, id: string) {
    const term = await this.prisma.consentTerm.findFirst({
      where: { id, clinicId },
    });

    if (!term) {
      throw new NotFoundException('Termo de consentimento não encontrado.');
    }

    return term;
  }

  async sign(clinicId: string, id: string) {
    const term = await this.findOne(clinicId, id);

    if (term.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser modificado.');
    }

    const signedAtDate = new Date();

    // Payload estável para hash SHA-256 consistente
    const payload = JSON.stringify({
      id: term.id,
      clinicId: term.clinicId,
      petId: term.petId,
      finalText: term.finalText,
      signedAt: signedAtDate.toISOString(),
    });

    const documentHash = crypto.createHash('sha256').update(payload).digest('hex');
    const verificationUrl = `/verify/${documentHash}`;

    // Gera o QR code absoluto para auditoria física externa
    const frontendUrl = process.env.FRONTEND_URL || 'https://vetos.ai';
    const absoluteVerificationUrl = `${frontendUrl}${verificationUrl}`;
    const verificationQrCode = await QRCode.toDataURL(absoluteVerificationUrl);

    return this.prisma.consentTerm.update({
      where: { id },
      data: {
        status: DocumentStatus.SIGNED,
        documentHash,
        signedAt: signedAtDate,
        verificationUrl,
        verificationQrCode,
      },
    });
  }

  async update(clinicId: string, id: string, data: Partial<CreateConsentTermDto>) {
    const term = await this.findOne(clinicId, id);

    if (term.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser modificado.');
    }

    return this.prisma.consentTerm.update({
      where: { id },
      data,
    });
  }

  async remove(clinicId: string, id: string) {
    const term = await this.findOne(clinicId, id);

    if (term.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser removido.');
    }

    await this.prisma.consentTerm.delete({
      where: { id },
    });

    return { success: true };
  }

  async share(clinicId: string, id: string, channels: ('EMAIL' | 'WHATSAPP')[]) {
    const doc = await this.prisma.consentTerm.findFirst({
      where: { id, clinicId },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
        clinic: true,
      },
    });

    if (!doc) {
      throw new NotFoundException('Termo de consentimento não encontrado.');
    }

    if (doc.status !== DocumentStatus.SIGNED) {
      throw new BadRequestException('Apenas termos de consentimento assinados podem ser compartilhados.');
    }

    const frontendUrl = process.env.FRONTEND_PUBLIC_URL || process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/documento/${doc.documentHash}`;
    const tutorName = doc.pet.client.name;
    const petName = doc.pet.name;
    const clinicName = doc.clinic.name;
    const signedAt = doc.signedAt
      ? new Date(doc.signedAt).toLocaleDateString('pt-BR')
      : new Date(doc.createdAt).toLocaleDateString('pt-BR');

    const messageBody = `📄 Termo de Consentimento Disponível

Olá, ${tutorName}!

A Clínica ${clinicName} compartilhou um Termo de Consentimento referente ao atendimento do pet ${petName}.

📄 Documento: Termo de Consentimento
🐾 Pet: ${petName}
📅 Registrado em: ${signedAt}

Visualize o termo emitido e registrado digitalmente pela clínica:
${link}

Atenciosamente,
Equipe ${clinicName}`;

    for (const channel of channels) {
      if (channel === 'EMAIL') {
        if (!doc.pet.client.email) {
          throw new BadRequestException('Tutor não possui e-mail cadastrado.');
        }
        await this.notificationsService.enqueueNotification({
          clinicId,
          channel: 'EMAIL',
          to: doc.pet.client.email,
          subject: `📄 Termo de Consentimento Disponível`,
          body: messageBody,
          event: 'CONSENT_TERM_SHARED',
          petId: doc.petId,
          clientId: doc.pet.clientId,
          consentTermId: doc.id,
        });
      } else if (channel === 'WHATSAPP') {
        if (!doc.pet.client.phone) {
          throw new BadRequestException('Tutor não possui telefone cadastrado.');
        }
        await this.notificationsService.enqueueNotification({
          clinicId,
          channel: 'WHATSAPP',
          to: doc.pet.client.phone,
          body: messageBody,
          event: 'CONSENT_TERM_SHARED',
          petId: doc.petId,
          clientId: doc.pet.clientId,
          consentTermId: doc.id,
        });
      }
    }

    await this.prisma.consentTerm.update({
      where: { id },
      data: {
        lastSharedAt: new Date(),
      },
    });

    return { success: true };
  }

  async tutorSign(hash: string, data: { name: string; cpf: string; ip: string; userAgent: string }) {
    const term = await this.prisma.consentTerm.findUnique({
      where: { documentHash: hash },
    });

    if (!term) {
      throw new NotFoundException('Termo de consentimento não encontrado.');
    }

    if (term.status !== DocumentStatus.SIGNED) {
      throw new BadRequestException('Apenas termos de consentimento assinados pela clínica podem receber assinatura do tutor.');
    }

    if (term.tutorSigned) {
      throw new BadRequestException('Este termo de consentimento já foi assinado pelo tutor.');
    }

    const cleanCpf = data.cpf.replace(/\D/g, '');
    if (!this.isValidCpf(cleanCpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    return this.prisma.consentTerm.update({
      where: { id: term.id },
      data: {
        tutorSigned: true,
        tutorSignedAt: new Date(),
        tutorSignatureName: data.name,
        tutorSignatureCpf: formattedCpf,
        tutorSignatureIp: data.ip,
        tutorSignatureUserAgent: data.userAgent,
      },
    });
  }

  private isValidCpf(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10), 10)) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11), 10)) return false;

    return true;
  }
}
