import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { DocumentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, data: CreatePrescriptionDto) {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: data.petId,
        clinicId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    return this.prisma.prescription.create({
      data: {
        medicamento: data.medicamento,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        duracao: data.duracao,
        viaAdministracao: data.viaAdministracao,
        observacoes: data.observacoes || null,
        status: DocumentStatus.DRAFT,
        petId: data.petId,
        clinicId,
        clinicalRecordId: data.clinicalRecordId || null,
        appointmentId: data.appointmentId || null,
      },
    });
  }

  async findOne(clinicId: string, id: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, clinicId },
    });

    if (!prescription) {
      throw new NotFoundException('Receita não encontrada.');
    }

    return prescription;
  }

  async sign(clinicId: string, id: string) {
    const prescription = await this.findOne(clinicId, id);

    if (prescription.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser modificado.');
    }

    const signedAtDate = new Date();

    // Cria payload estável com ordenação de chaves para o cálculo consistente do hash
    const payload = JSON.stringify({
      id: prescription.id,
      clinicId: prescription.clinicId,
      petId: prescription.petId,
      medicamento: prescription.medicamento,
      dosagem: prescription.dosagem,
      frequencia: prescription.frequencia,
      duracao: prescription.duracao,
      viaAdministracao: prescription.viaAdministracao,
      signedAt: signedAtDate.toISOString(),
    });

    const documentHash = crypto.createHash('sha256').update(payload).digest('hex');
    const verificationUrl = `/verify/${documentHash}`;

    // Gera o QR code absoluto para leituras externas via scanner de celular
    const frontendUrl = process.env.FRONTEND_URL || 'https://vetos.ai';
    const absoluteVerificationUrl = `${frontendUrl}${verificationUrl}`;
    const verificationQrCode = await QRCode.toDataURL(absoluteVerificationUrl);

    return this.prisma.prescription.update({
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

  async update(clinicId: string, id: string, data: Partial<CreatePrescriptionDto>) {
    const prescription = await this.findOne(clinicId, id);

    if (prescription.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser modificado.');
    }

    return this.prisma.prescription.update({
      where: { id },
      data,
    });
  }

  async remove(clinicId: string, id: string) {
    const prescription = await this.findOne(clinicId, id);

    if (prescription.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Este documento já foi assinado e não pode ser removido.');
    }

    await this.prisma.prescription.delete({
      where: { id },
    });

    return { success: true };
  }
}
