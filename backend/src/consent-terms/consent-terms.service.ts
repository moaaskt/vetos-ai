import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { CreateConsentTermDto } from './dto/create-consent-term.dto';
import { DocumentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class ConsentTermsService {
  constructor(private prisma: PrismaService) {}

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
}
