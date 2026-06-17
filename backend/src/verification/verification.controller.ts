import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';

@Controller('verify')
export class VerificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':hash')
  async verify(@Param('hash') hash: string) {
    // 1. Busca primeiro em receitas médicas assinadas
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        documentHash: hash,
        status: DocumentStatus.SIGNED,
      },
      include: {
        pet: true,
        clinic: true,
      },
    });

    if (prescription) {
      return {
        verified: true,
        documentType: 'RECEITA_MEDICA',
        clinicName: prescription.clinic.name,
        petName: prescription.pet.name,
        signedAt: prescription.signedAt,
        status: 'SIGNED',
      };
    }

    // 2. Busca em termos de consentimento assinados
    const consentTerm = await this.prisma.consentTerm.findFirst({
      where: {
        documentHash: hash,
        status: DocumentStatus.SIGNED,
      },
      include: {
        pet: true,
        clinic: true,
      },
    });

    if (consentTerm) {
      return {
        verified: true,
        documentType: 'TERMO_DE_CONSENTIMENTO',
        clinicName: consentTerm.clinic.name,
        petName: consentTerm.pet.name,
        signedAt: consentTerm.signedAt,
        status: 'SIGNED',
      };
    }

    // 3. Caso não encontre em nenhuma tabela
    throw new NotFoundException('Documento não encontrado ou inválido.');
  }
}
