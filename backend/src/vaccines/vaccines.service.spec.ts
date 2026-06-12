import { Test, TestingModule } from '@nestjs/testing';
import { VaccinesService } from './vaccines.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    vaccineProtocol: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vaccineProtocolDose: {
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    prisma.pet.findFirst.mockReset();
    prisma.clinic.findUnique.mockReset();
    prisma.vaccineRecord.create.mockReset();
    prisma.vaccineRecord.deleteMany.mockReset();
    prisma.vaccineRecord.findFirst.mockReset();
    prisma.vaccineRecord.findMany.mockReset();
    prisma.vaccineRecord.update.mockReset();
    prisma.vaccineProtocol.create.mockReset();
    prisma.vaccineProtocol.findFirst.mockReset();
    prisma.vaccineProtocol.findMany.mockReset();
    prisma.vaccineProtocol.update.mockReset();
    prisma.vaccineProtocol.delete.mockReset();
    prisma.vaccineProtocolDose.deleteMany.mockReset();
    prisma.vaccineProtocolDose.findUnique.mockReset();

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

  describe('applyProtocol', () => {
    it('throws NotFoundException if pet does not exist', async () => {
      prisma.pet.findFirst.mockResolvedValue(null);
      await expect(
        service.applyProtocol('clinic-1', {
          petId: 'pet-1',
          protocolId: 'proto-1',
          startDate: '2026-06-10T00:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates scheduled vaccine records correctly based on protocol doses', async () => {
      const mockPet = { id: 'pet-1', name: 'Rex', clinicId: 'clinic-1' };
      const mockProtocol = {
        id: 'proto-1',
        name: 'Protocolo Canino',
        clinicId: 'clinic-1',
        doses: [
          { id: 'dose-1', vaccineName: 'V10 (D1)', doseOrder: 1, intervalDays: 0 },
          { id: 'dose-2', vaccineName: 'V10 (D2)', doseOrder: 2, intervalDays: 21 },
        ],
      };

      prisma.pet.findFirst.mockResolvedValue(mockPet);
      prisma.vaccineProtocol.findFirst.mockResolvedValue(mockProtocol);
      prisma.vaccineRecord.create.mockImplementation(({ data }) => Promise.resolve({ id: 'rec-new', ...data }));

      const result = await service.applyProtocol('clinic-1', {
        petId: 'pet-1',
        protocolId: 'proto-1',
        startDate: '2026-06-10T00:00:00.000Z',
      });

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('V10 (D1)');
      expect(result[0].status).toBe('SCHEDULED');
      expect(result[0].date.toISOString()).toBe(new Date('2026-06-10T00:00:00.000Z').toISOString());

      // Segunda dose: +21 dias = 2026-07-01
      expect(result[1].name).toBe('V10 (D2)');
      expect(result[1].status).toBe('SCHEDULED');
      expect(result[1].date.toISOString()).toBe(new Date('2026-07-01T00:00:00.000Z').toISOString());
    });
  });

  describe('applyScheduledDose', () => {
    it('updates dose status to APPLIED and recalculates subsequent doses if requested', async () => {
      const mockRecord = {
        id: 'rec-1',
        name: 'V10 (D1)',
        status: 'SCHEDULED',
        date: new Date('2026-06-10T00:00:00.000Z'),
        petId: 'pet-1',
        protocolId: 'proto-1',
        protocolDoseId: 'dose-1',
        clinicId: 'clinic-1',
      };

      prisma.vaccineRecord.findFirst.mockResolvedValue(mockRecord);
      prisma.vaccineRecord.update.mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data }));
      prisma.vaccineProtocolDose.findUnique.mockResolvedValue({ id: 'dose-1', doseOrder: 1, intervalDays: 0 });

      // Próxima dose que está agendada
      const mockSubsequent = [
        {
          id: 'rec-2',
          name: 'V10 (D2)',
          status: 'SCHEDULED',
          date: new Date('2026-07-01T00:00:00.000Z'),
          petId: 'pet-1',
          protocolId: 'proto-1',
          protocolDoseId: 'dose-2',
          clinicId: 'clinic-1',
          protocolDose: {
            id: 'dose-2',
            doseOrder: 2,
            intervalDays: 21,
          },
        },
      ];

      prisma.vaccineRecord.findMany.mockResolvedValue(mockSubsequent);

      // Aplica a vacina com 5 dias de atraso (2026-06-15)
      const result = await service.applyScheduledDose('clinic-1', 'rec-1', {
        date: '2026-06-15T00:00:00.000Z',
        recalculateSubsequent: true,
      });

      expect(result.status).toBe('APPLIED');
      expect(result.date.toISOString()).toBe(new Date('2026-06-15T00:00:00.000Z').toISOString());

      // Deve ter recalculado a próxima dose para +21 dias da aplicação real (2026-07-06)
      expect(prisma.vaccineRecord.update).toHaveBeenCalledWith({
        where: { id: 'rec-2' },
        data: { date: new Date('2026-07-06T00:00:00.000Z') },
      });
    });

    it('throws BadRequestException if attempting to apply a dose when previous protocol doses are still SCHEDULED', async () => {
      const mockRecord = {
        id: 'rec-2',
        name: 'V10 (D2)',
        status: 'SCHEDULED',
        date: new Date('2026-07-01T00:00:00.000Z'),
        petId: 'pet-1',
        protocolId: 'proto-1',
        protocolDoseId: 'dose-2',
        clinicId: 'clinic-1',
      };

      prisma.vaccineRecord.findFirst.mockResolvedValue(mockRecord);
      prisma.vaccineProtocolDose.findUnique.mockResolvedValue({ id: 'dose-2', doseOrder: 2, intervalDays: 21 });

      const siblingRecords = [
        {
          id: 'rec-1',
          name: 'V10 (D1)',
          status: 'SCHEDULED',
          date: new Date('2026-06-10T00:00:00.000Z'),
          petId: 'pet-1',
          protocolId: 'proto-1',
          protocolDoseId: 'dose-1',
          clinicId: 'clinic-1',
          protocolDose: {
            id: 'dose-1',
            doseOrder: 1,
            intervalDays: 0,
          },
        },
        {
          id: 'rec-2',
          name: 'V10 (D2)',
          status: 'SCHEDULED',
          date: new Date('2026-07-01T00:00:00.000Z'),
          petId: 'pet-1',
          protocolId: 'proto-1',
          protocolDoseId: 'dose-2',
          clinicId: 'clinic-1',
          protocolDose: {
            id: 'dose-2',
            doseOrder: 2,
            intervalDays: 21,
          },
        },
      ];

      prisma.vaccineRecord.findMany.mockResolvedValue(siblingRecords);

      await expect(
        service.applyScheduledDose('clinic-1', 'rec-2', {
          date: '2026-07-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(new BadRequestException('Esta dose não pode ser aplicada ainda. Existem etapas anteriores pendentes.'));
    });

    it('allows applying a dose if all previous doses of the protocol are APPLIED', async () => {
      const mockRecord = {
        id: 'rec-2',
        name: 'V10 (D2)',
        status: 'SCHEDULED',
        date: new Date('2026-07-01T00:00:00.000Z'),
        petId: 'pet-1',
        protocolId: 'proto-1',
        protocolDoseId: 'dose-2',
        clinicId: 'clinic-1',
      };

      prisma.vaccineRecord.findFirst.mockResolvedValue(mockRecord);
      prisma.vaccineRecord.update.mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data }));
      prisma.vaccineProtocolDose.findUnique.mockResolvedValue({ id: 'dose-2', doseOrder: 2, intervalDays: 21 });

      const siblingRecords = [
        {
          id: 'rec-1',
          name: 'V10 (D1)',
          status: 'APPLIED',
          date: new Date('2026-06-10T00:00:00.000Z'),
          petId: 'pet-1',
          protocolId: 'proto-1',
          protocolDoseId: 'dose-1',
          clinicId: 'clinic-1',
          protocolDose: {
            id: 'dose-1',
            doseOrder: 1,
            intervalDays: 0,
          },
        },
        {
          id: 'rec-2',
          name: 'V10 (D2)',
          status: 'SCHEDULED',
          date: new Date('2026-07-01T00:00:00.000Z'),
          petId: 'pet-1',
          protocolId: 'proto-1',
          protocolDoseId: 'dose-2',
          clinicId: 'clinic-1',
          protocolDose: {
            id: 'dose-2',
            doseOrder: 2,
            intervalDays: 21,
          },
        },
      ];

      prisma.vaccineRecord.findMany.mockResolvedValue(siblingRecords);

      const result = await service.applyScheduledDose('clinic-1', 'rec-2', {
        date: '2026-07-01T00:00:00.000Z',
      });

      expect(result.status).toBe('APPLIED');
    });
  });
});

