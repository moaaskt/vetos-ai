import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';

@Injectable()
export class WeightRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, data: CreateWeightRecordDto) {
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

    return this.prisma.weightRecord.create({
      data: {
        weight: Number(data.weight),
        date: new Date(data.date),
        petId: data.petId,
        clinicId,
      },
    });
  }

  async remove(clinicId: string, id: string) {
    const result = await this.prisma.weightRecord.deleteMany({
      where: {
        id,
        clinicId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Registro de peso não encontrado ou não pertencente a esta clínica.',
      );
    }

    return { success: true };
  }
}
