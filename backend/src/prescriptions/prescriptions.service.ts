import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { DocumentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

  async share(clinicId: string, id: string, channels: ('EMAIL' | 'WHATSAPP')[]) {
    const doc = await this.prisma.prescription.findFirst({
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
      throw new NotFoundException('Receita não encontrada.');
    }

    if (doc.status !== DocumentStatus.SIGNED) {
      throw new BadRequestException('Apenas receitas assinadas podem ser compartilhadas.');
    }

    const frontendUrl = process.env.FRONTEND_PUBLIC_URL || process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/documento/${doc.documentHash}`;
    const tutorName = doc.pet.client.name;
    const petName = doc.pet.name;
    const clinicName = doc.clinic.name;
    const issuedAt = doc.signedAt
      ? new Date(doc.signedAt).toLocaleDateString('pt-BR')
      : new Date(doc.createdAt).toLocaleDateString('pt-BR');

    const messageBody = `🐾 Receita Médica Disponível

Olá, ${tutorName}!

A Clínica ${clinicName} disponibilizou uma receita médica para o pet ${petName}.

📄 Documento: Receita Médica
🐾 Pet: ${petName}
📅 Emitido em: ${issuedAt}

Visualize o documento assinado digitalmente:
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
          subject: `🐾 Receita Médica Disponível`,
          body: messageBody,
          event: 'PRESCRIPTION_SHARED',
          petId: doc.petId,
          clientId: doc.pet.clientId,
          prescriptionId: doc.id,
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
          event: 'PRESCRIPTION_SHARED',
          petId: doc.petId,
          clientId: doc.pet.clientId,
          prescriptionId: doc.id,
        });
      }
    }

    await this.prisma.prescription.update({
      where: { id },
      data: {
        lastSharedAt: new Date(),
      },
    });

    return { success: true };
  }
}
