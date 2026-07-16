import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TutorPetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPets(allowedPetIds: string[]) {
    if (allowedPetIds.length === 0) return [];

    return this.prisma.pet.findMany({
      where: { id: { in: allowedPetIds } },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        age: true,
        clinic: {
          select: {
            name: true,
          }
        }
      },
    });
  }

  async getPetDetails(petId: string, allowedPetIds: string[]) {
    if (!allowedPetIds.includes(petId)) {
      throw new NotFoundException('Pet não encontrado ou acesso não autorizado.');
    }

    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        clinic: {
          select: {
            name: true,
            phone: true,
            address: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
        allergies: {
          select: {
            id: true,
            name: true,
          },
        },
        weightRecords: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
        appointments: {
          where: {
            status: 'SCHEDULED',
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 1,
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return pet;
  }
}
