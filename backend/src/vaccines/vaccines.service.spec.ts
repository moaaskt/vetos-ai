import { Test, TestingModule } from '@nestjs/testing';
import { VaccinesService } from './vaccines.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('VaccinesService', () => {
  let service: VaccinesService;
  const prisma = {
    pet: {
      findFirst: jest.fn(),
    },
    clinic: {
      findUnique: jest.fn(),
    },
    vaccineRecord: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    prisma.pet.findFirst.mockReset();
    prisma.clinic.findUnique.mockReset();
    prisma.vaccineRecord.create.mockReset();
    prisma.vaccineRecord.deleteMany.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccinesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<VaccinesService>(VaccinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCertificateStream', () => {
    it('throws NotFoundException if pet does not exist or does not belong to clinic', async () => {
      prisma.pet.findFirst.mockResolvedValue(null);

      await expect(
        service.generateCertificateStream('clinic-1', 'pet-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'pet-1',
          clinicId: 'clinic-1',
        },
        include: {
          client: true,
          vaccineRecords: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });
    });

    it('generates pdf stream successfully for valid pet', async () => {
      const mockPet = {
        id: 'pet-1',
        name: 'Rex',
        species: 'Dog',
        breed: 'Labrador',
        age: 3,
        client: {
          name: 'John Doe',
          phone: '123456789',
        },
        vaccineRecords: [
          {
            id: 'vac-1',
            name: 'Raiva',
            date: new Date('2026-01-01'),
            nextDoseDate: new Date('2027-01-01'),
          },
        ],
      };

      const mockClinic = {
        id: 'clinic-1',
        name: 'Clinica Vet',
        address: 'Rua Principal, 123',
        phone: '987654321',
      };

      prisma.pet.findFirst.mockResolvedValue(mockPet);
      prisma.clinic.findUnique.mockResolvedValue(mockClinic);

      const result = await service.generateCertificateStream('clinic-1', 'pet-1');

      expect(result).toBeDefined();
      expect(result.petName).toBe('Rex');
      expect(result.stream).toBeDefined();

      // Consome o stream para verificar se gera dados válidos de PDF
      const dataChunks: any[] = [];
      await new Promise<void>((resolve, reject) => {
        result.stream.on('data', (chunk) => dataChunks.push(chunk));
        result.stream.on('end', () => resolve());
        result.stream.on('error', (err) => reject(err));
      });

      expect(Buffer.concat(dataChunks).length).toBeGreaterThan(0);
    });

    it('generates pdf stream successfully even with no vaccines', async () => {
      const mockPet = {
        id: 'pet-1',
        name: 'Rex',
        species: 'Dog',
        breed: null,
        age: null,
        client: null,
        vaccineRecords: [],
      };

      prisma.pet.findFirst.mockResolvedValue(mockPet);
      prisma.clinic.findUnique.mockResolvedValue(null);

      const result = await service.generateCertificateStream('clinic-1', 'pet-1');

      expect(result).toBeDefined();
      expect(result.petName).toBe('Rex');
      expect(result.stream).toBeDefined();

      const dataChunks: any[] = [];
      await new Promise<void>((resolve, reject) => {
        result.stream.on('data', (chunk) => dataChunks.push(chunk));
        result.stream.on('end', () => resolve());
        result.stream.on('error', (err) => reject(err));
      });

      expect(Buffer.concat(dataChunks).length).toBeGreaterThan(0);
    });
  });
});
