import { Test, TestingModule } from '@nestjs/testing';
import { ConsentTermsService } from './consent-terms.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

describe('ConsentTermsService', () => {
  let service: ConsentTermsService;

  const mockPrisma = {
    pet: {
      findFirst: jest.fn(),
    },
    consentTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    consentTerm: {
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
        ConsentTermsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ConsentTermsService>(ConsentTermsService);
  });

  describe('findAllTemplates', () => {
    it('returns existing templates if available', async () => {
      const existing = [{ id: 'tpl-1', name: 'Castração', baseText: '...', clinicId: 'clinic-1' }];
      mockPrisma.consentTemplate.findMany.mockResolvedValue(existing);

      const result = await service.findAllTemplates('clinic-1');
      expect(result).toEqual(existing);
      expect(mockPrisma.consentTemplate.create).not.toHaveBeenCalled();
    });

    it('auto-populates default templates if none exist', async () => {
      mockPrisma.consentTemplate.findMany.mockResolvedValue([]);
      mockPrisma.consentTemplate.create.mockImplementation((args) => ({
        id: 'tpl-auto',
        ...args.data,
      }));

      const result = await service.findAllTemplates('clinic-1');
      expect(result).toHaveLength(3);
      expect(mockPrisma.consentTemplate.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('create term', () => {
    it('creates a term and interpolates placeholders correctly', async () => {
      const mockPet = {
        id: 'pet-1',
        name: 'Pipoca',
        client: { name: 'Mariana' },
        clinic: { name: 'Vet Feliz' },
      };

      mockPrisma.pet.findFirst.mockResolvedValue(mockPet);
      mockPrisma.consentTerm.create.mockImplementation((args) => ({
        id: 'term-1',
        ...args.data,
      }));

      const dto = {
        petId: 'pet-1',
        finalText: 'Eu, {tutor_name}, autorizo o procedimento no paciente {pet_name} na clínica {clinic_name}.',
      };

      const result = await service.create('clinic-1', dto);
      expect(result).toBeDefined();
      expect(result.finalText).toBe('Eu, Mariana, autorizo o procedimento no paciente Pipoca na clínica Vet Feliz.');
      expect(result.status).toBe(DocumentStatus.DRAFT);
    });

    it('throws NotFoundException if pet does not belong to clinic', async () => {
      mockPrisma.pet.findFirst.mockResolvedValue(null);

      const dto = { petId: 'pet-1', finalText: 'Termo...' };

      await expect(service.create('clinic-1', dto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.consentTerm.create).not.toHaveBeenCalled();
    });
  });

  describe('sign', () => {
    it('signs the term and generates hash and QR Code', async () => {
      const mockTerm = {
        id: 'term-1',
        clinicId: 'clinic-1',
        petId: 'pet-1',
        finalText: 'Mariana autorizou...',
        status: DocumentStatus.DRAFT,
      };

      mockPrisma.consentTerm.findFirst.mockResolvedValue(mockTerm);
      mockPrisma.consentTerm.update.mockImplementation(({ data }) => ({
        ...mockTerm,
        ...data,
      }));

      const result = await service.sign('clinic-1', 'term-1');
      expect(result.status).toBe(DocumentStatus.SIGNED);
      expect(result.documentHash).toHaveLength(64);
      expect(result.verificationUrl).toBe(`/verify/${result.documentHash}`);
      expect(result.verificationQrCode).toContain('data:image/png;base64,');
    });

    it('throws BadRequestException if term is already signed', async () => {
      mockPrisma.consentTerm.findFirst.mockResolvedValue({
        id: 'term-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.SIGNED,
      });

      await expect(service.sign('clinic-1', 'term-1')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.consentTerm.update).not.toHaveBeenCalled();
    });
  });

  describe('restrictions', () => {
    it('prevents update and delete if status is SIGNED', async () => {
      mockPrisma.consentTerm.findFirst.mockResolvedValue({
        id: 'term-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.SIGNED,
      });

      await expect(service.update('clinic-1', 'term-1', { finalText: 'Alterado' })).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.remove('clinic-1', 'term-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.consentTerm.delete).not.toHaveBeenCalled();
    });
  });
});
