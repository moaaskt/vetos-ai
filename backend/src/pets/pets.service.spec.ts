import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PetsService', () => {
  let service: PetsService;
  const prisma = {
    pet: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    prisma.pet.create.mockReset();
    prisma.pet.updateMany.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a pet successfully with a valid species (DOG)', async () => {
      const mockPet = {
        name: 'Rex',
        species: 'DOG',
        breed: 'Labrador',
        age: 3,
        clientId: 'client-1',
      };
      prisma.pet.create.mockResolvedValue(mockPet);

      const result = await service.create('clinic-1', mockPet);
      expect(result).toBeDefined();
      expect(result.species).toBe('DOG');
      expect(prisma.pet.create).toHaveBeenCalledWith({
        data: { ...mockPet, clinicId: 'clinic-1' },
      });
    });

    it('creates a pet successfully with a valid species (OTHER)', async () => {
      const mockPet = {
        name: 'Bubbles',
        species: 'OTHER',
        breed: 'Goldfish',
        age: 1,
        clientId: 'client-1',
      };
      prisma.pet.create.mockResolvedValue(mockPet);

      const result = await service.create('clinic-1', mockPet);
      expect(result.species).toBe('OTHER');
    });

    it('throws BadRequestException if species is invalid', () => {
      const mockPet = {
        name: 'Rex',
        species: 'CANINO',
        breed: 'Labrador',
        age: 3,
        clientId: 'client-1',
      };

      expect(() => service.create('clinic-1', mockPet)).toThrow(
        'Espécie inválida. As espécies permitidas são DOG, CAT ou OTHER.',
      );
      expect(prisma.pet.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates a pet successfully with a valid species', async () => {
      prisma.pet.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.update('clinic-1', 'pet-1', { species: 'CAT' });
      expect(result).toBeDefined();
      expect(prisma.pet.updateMany).toHaveBeenCalledWith({
        where: { id: 'pet-1', clinicId: 'clinic-1' },
        data: { species: 'CAT' },
      });
    });

    it('throws BadRequestException if updated species is invalid', () => {
      expect(() => service.update('clinic-1', 'pet-1', { species: 'GATO' })).toThrow(
        'Espécie inválida. As espécies permitidas são DOG, CAT ou OTHER.',
      );
      expect(prisma.pet.updateMany).not.toHaveBeenCalled();
    });

    it('updates a pet without updating species successfully', async () => {
      prisma.pet.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.update('clinic-1', 'pet-1', { name: 'New Name' });
      expect(result).toBeDefined();
      expect(prisma.pet.updateMany).toHaveBeenCalled();
    });
  });
});
