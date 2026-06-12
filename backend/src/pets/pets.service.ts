import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, data: any) {
    const allowedSpecies = ['DOG', 'CAT', 'OTHER'];
    if (!allowedSpecies.includes(data.species)) {
      throw new BadRequestException(
        'Espécie inválida. As espécies permitidas são DOG, CAT ou OTHER.',
      );
    }
    return this.prisma.pet.create({
      data: { ...data, clinicId },
    });
  }

  findAll(clinicId: string) {
    return this.prisma.pet.findMany({ where: { clinicId } });
  }

  findOne(clinicId: string, id: string) {
    return this.prisma.pet.findFirst({
      where: { id, clinicId },
      include: {
        client: true,
        appointments: {
          orderBy: { date: 'desc' },
        },
        allergies: {
          orderBy: { createdAt: 'desc' },
        },
        clinicalRecords: {
          orderBy: { date: 'desc' },
        },
        vaccineRecords: {
          include: {
            protocolDose: true,
          },
          orderBy: { date: 'desc' },
        },
        weightRecords: {
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  update(clinicId: string, id: string, data: any) {
    if (data.species) {
      const allowedSpecies = ['DOG', 'CAT', 'OTHER'];
      if (!allowedSpecies.includes(data.species)) {
        throw new BadRequestException(
          'Espécie inválida. As espécies permitidas são DOG, CAT ou OTHER.',
        );
      }
    }
    return this.prisma.pet.updateMany({
      where: { id, clinicId },
      data,
    });
  }

  remove(clinicId: string, id: string) {
    return this.prisma.pet.deleteMany({
      where: { id, clinicId },
    });
  }
}
