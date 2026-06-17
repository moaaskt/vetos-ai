import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsService } from './prescriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;

  const mockPrisma = {
    pet: {
      findFirst: jest.fn(),
    },
    prescription: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
  });

  describe('create', () => {
    const createDto = {
      medicamento: 'Amoxicilina',
      dosagem: '250mg',
      frequencia: '12h',
      duracao: '7 dias',
      viaAdministracao: 'Oral',
      petId: 'pet-1',
    };

    it('creates a prescription successfully if pet belongs to clinic', async () => {
      mockPrisma.pet.findFirst.mockResolvedValue({ id: 'pet-1', clinicId: 'clinic-1' });
      mockPrisma.prescription.create.mockResolvedValue({
        id: 'presc-1',
        ...createDto,
        status: DocumentStatus.DRAFT,
      });

      const result = await service.create('clinic-1', createDto);
      expect(result).toBeDefined();
      expect(result.status).toBe(DocumentStatus.DRAFT);
      expect(mockPrisma.pet.findFirst).toHaveBeenCalledWith({
        where: { id: 'pet-1', clinicId: 'clinic-1' },
      });
    });

    it('throws NotFoundException if pet does not belong to clinic', async () => {
      mockPrisma.pet.findFirst.mockResolvedValue(null);

      await expect(service.create('clinic-1', createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.prescription.create).not.toHaveBeenCalled();
    });
  });

  describe('sign', () => {
    it('signs the prescription, generates hash, verification URL and QR Code', async () => {
      const mockPrescription = {
        id: 'presc-1',
        clinicId: 'clinic-1',
        petId: 'pet-1',
        medicamento: 'Amoxicilina',
        dosagem: '250mg',
        frequencia: '12h',
        duracao: '7 dias',
        viaAdministracao: 'Oral',
        status: DocumentStatus.DRAFT,
      };

      mockPrisma.prescription.findFirst.mockResolvedValue(mockPrescription);
      mockPrisma.prescription.update.mockImplementation(({ data }) => ({
        ...mockPrescription,
        ...data,
      }));

      const result = await service.sign('clinic-1', 'presc-1');
      expect(result.status).toBe(DocumentStatus.SIGNED);
      expect(result.documentHash).toHaveLength(64); // SHA-256 length in hex
      expect(result.verificationUrl).toBe(`/verify/${result.documentHash}`);
      expect(result.verificationQrCode).toContain('data:image/png;base64,');
    });

    it('throws BadRequestException if prescription is already signed', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue({
        id: 'presc-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.SIGNED,
      });

      await expect(service.sign('clinic-1', 'presc-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.prescription.update).not.toHaveBeenCalled();
    });
  });

  describe('update and remove restrictions', () => {
    it('throws BadRequestException when updating a signed prescription', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue({
        id: 'presc-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.SIGNED,
      });

      await expect(service.update('clinic-1', 'presc-1', { medicamento: 'Enalapril' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when removing a signed prescription', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue({
        id: 'presc-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.SIGNED,
      });

      await expect(service.remove('clinic-1', 'presc-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.prescription.delete).not.toHaveBeenCalled();
    });
  });
});
