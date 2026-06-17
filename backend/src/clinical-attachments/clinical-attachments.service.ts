import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class ClinicalAttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // Auxiliar para validar se o Pet pertence à Clinic logada
  private async validatePetClinic(clinicId: string, petId: string): Promise<void> {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        clinicId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }
  }

  async create(
    clinicId: string,
    petId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    uploadedById?: string,
    clinicalRecordId?: string,
    notes?: string,
  ) {
    // 1. Validar posse do tenant para o Pet
    await this.validatePetClinic(clinicId, petId);

    // Se um clinicalRecordId foi fornecido, valida se pertence à clínica/pet
    if (clinicalRecordId) {
      const record = await this.prisma.clinicalRecord.findFirst({
        where: {
          id: clinicalRecordId,
          petId,
          clinicId,
        },
      });
      if (!record) {
        throw new NotFoundException('Registro clínico não encontrado para este paciente.');
      }
    }

    // 2. Gerar chaves e armazenar fisicamente
    const extension = path.extname(file.originalname);
    const storedFileName = `${randomUUID()}${extension}`;
    const storageKey = `clinics/${clinicId}/pets/${petId}/${storedFileName}`;

    // Salvar via StorageService (desacoplado)
    await this.storageService.save(storageKey, file.buffer);

    // 3. Salvar metadados no Prisma (fileSize é BigInt no Schema)
    return this.prisma.clinicalAttachment.create({
      data: {
        clinicId,
        petId,
        clinicalRecordId: clinicalRecordId || null,
        originalFileName: file.originalname,
        storedFileName,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        storagePath: storageKey,
        uploadedById: uploadedById || null,
        notes: notes || null,
      },
    });
  }

  async findAllByPet(clinicId: string, petId: string) {
    // Validar posse do tenant
    await this.validatePetClinic(clinicId, petId);

    const attachments = await this.prisma.clinicalAttachment.findMany({
      where: {
        petId,
        clinicId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Retorna serializando BigInt para compatibilidade com JSON/Response
    return attachments.map((att) => ({
      ...att,
      fileSize: Number(att.fileSize),
    }));
  }

  async getDownloadStream(clinicId: string, id: string) {
    const attachment = await this.prisma.clinicalAttachment.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo clínico não encontrado ou acesso não autorizado.');
    }

    const stream = await this.storageService.getFileStream(attachment.storagePath);

    return {
      stream,
      mimeType: attachment.mimeType,
      originalFileName: attachment.originalFileName,
    };
  }

  async remove(clinicId: string, id: string) {
    const attachment = await this.prisma.clinicalAttachment.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo clínico não encontrado ou acesso não autorizado.');
    }

    // 1. Deletar fisicamente via StorageService
    await this.storageService.delete(attachment.storagePath);

    // 2. Remover metadados do banco
    await this.prisma.clinicalAttachment.delete({
      where: {
        id,
      },
    });

    return { success: true };
  }
}
