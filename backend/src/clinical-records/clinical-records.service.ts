import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';

@Injectable()
export class ClinicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, data: CreateClinicalRecordDto) {
    // Valida se o pet pertence à clínica logada
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: data.petId,
        clinicId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    return this.prisma.clinicalRecord.create({
      data: {
        type: data.type,
        title: data.title || null,
        content: data.content,
        date: data.date ? new Date(data.date) : new Date(),
        petId: data.petId,
        clinicId,
      },
    });
  }

  async remove(clinicId: string, id: string) {
    const result = await this.prisma.clinicalRecord.deleteMany({
      where: {
        id,
        clinicId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Registro clínico não encontrado ou não pertencente a esta clínica.',
      );
    }

    return { success: true };
  }
}
