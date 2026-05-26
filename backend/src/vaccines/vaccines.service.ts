import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';

@Injectable()
export class VaccinesService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, data: CreateVaccineDto) {
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

    return this.prisma.vaccineRecord.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
        petId: data.petId,
        clinicId,
      },
    });
  }

  async remove(clinicId: string, id: string) {
    const result = await this.prisma.vaccineRecord.deleteMany({
      where: {
        id,
        clinicId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Registro de vacina não encontrado ou não pertencente a esta clínica.',
      );
    }

    return { success: true };
  }
}
