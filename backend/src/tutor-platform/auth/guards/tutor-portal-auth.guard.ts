import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TutorPortalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Acesso negado: Token de tutor ausente.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = process.env.TUTOR_JWT_SECRET || 'super-secret-tutor-dev-key';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Garante que o payload pertence à TutorPlatform (B2C) e possui tutorIdentityId
      if (!payload.tutorIdentityId) {
        throw new UnauthorizedException('Acesso negado: Token inválido para a plataforma do tutor.');
      }

      // Injeta o tutor autenticado na requisição
      request.tutor = {
        tutorIdentityId: payload.tutorIdentityId,
        publicId: payload.publicId,
        allowedClientIds: payload.allowedClientIds || [],
        allowedClinicIds: payload.allowedClinicIds || [],
        allowedPetIds: payload.allowedPetIds || [],
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Sessão expirada ou token de tutor inválido.');
    }
  }
}
