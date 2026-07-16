import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TutorProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tutorIdentityId: string) {
    const identity = await this.prisma.tutorIdentity.findUnique({
      where: { id: tutorIdentityId },
    });

    if (!identity) {
      throw new NotFoundException('TutorIdentity não encontrada.');
    }

    let maskedCpf = undefined;
    if (identity.cpf) {
      maskedCpf = `***.${identity.cpf.substring(3, 6)}.${identity.cpf.substring(6, 9)}-**`;
    }

    return {
      id: identity.publicId,
      name: identity.name,
      primaryEmail: identity.primaryEmail,
      primaryWhatsapp: identity.primaryWhatsapp,
      preferredChannel: identity.preferredChannel,
      locale: identity.locale,
      timezone: identity.timezone,
      cpf: maskedCpf,
    };
  }
}
