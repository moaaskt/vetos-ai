import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConsentTermsService } from '../consent-terms/consent-terms.service';
import { NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

describe('VerificationController', () => {
  let controller: VerificationController;

  const mockPrisma = {
    prescription: {
      findFirst: jest.fn(),
    },
    consentTerm: {
      findFirst: jest.fn(),
    },
  };

  const mockConsentTermsService = {
    tutorSign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConsentTermsService,
          useValue: mockConsentTermsService,
        },
      ],
    }).compile();

    controller = module.get<VerificationController>(VerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verify', () => {
    const hash = 'a6c8e31...';

    it('returns prescription metadata if a signed prescription is found', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue({
        id: 'presc-1',
        medicamento: 'Amoxicilina', // Campo sensível que não deve ser exposto na resposta
        signedAt: new Date('2026-06-17T12:00:00Z'),
        status: DocumentStatus.SIGNED,
        clinic: { name: 'Clinica Vet' },
        pet: { name: 'Bidu' },
      });

      const result = await controller.verify(hash);
      expect(result).toBeDefined();
      expect(result.verified).toBe(true);
      expect(result.documentType).toBe('RECEITA_MEDICA');
      expect(result.clinicName).toBe('Clinica Vet');
      expect(result.petName).toBe('Bidu');
      expect(result.status).toBe('SIGNED');
      // Garantir que dados sensíveis não vazaram
      expect(result).not.toHaveProperty('medicamento');
    });

    it('returns consent term metadata if a signed term is found', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue(null);
      mockPrisma.consentTerm.findFirst.mockResolvedValue({
        id: 'term-1',
        finalText: 'Mariana autorizou...', // Campo sensível
        signedAt: new Date('2026-06-17T13:00:00Z'),
        status: DocumentStatus.SIGNED,
        clinic: { name: 'Clinica Vet' },
        pet: { name: 'Bidu' },
      });

      const result = await controller.verify(hash);
      expect(result).toBeDefined();
      expect(result.verified).toBe(true);
      expect(result.documentType).toBe('TERMO_DE_CONSENTIMENTO');
      expect(result.clinicName).toBe('Clinica Vet');
      expect(result.petName).toBe('Bidu');
      expect(result.status).toBe('SIGNED');
      // Garantir que dados sensíveis não vazaram
      expect(result).not.toHaveProperty('finalText');
    });

    it('throws NotFoundException if hash does not exist in either table', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue(null);
      mockPrisma.consentTerm.findFirst.mockResolvedValue(null);

      await expect(controller.verify(hash)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDetails', () => {
    const hash = 'a6c8e31...';

    it('returns full prescription object if signed', async () => {
      const mockPrescription = {
        id: 'presc-1',
        medicamento: 'Amoxicilina',
        dosagem: '250mg',
        status: DocumentStatus.SIGNED,
        clinic: { name: 'Clinica Vet' },
        pet: { name: 'Bidu', client: { name: 'John Doe' } },
      };
      mockPrisma.prescription.findFirst.mockResolvedValue(mockPrescription);

      const result = await controller.getDetails(hash);
      expect(result).toBeDefined();
      expect(result.documentType).toBe('RECEITA_MEDICA');
      expect(result.document).toEqual(mockPrescription);
    });

    it('returns full consent term object if signed', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue(null);
      const mockConsentTerm = {
        id: 'term-1',
        finalText: 'Mariana autorizou...',
        status: DocumentStatus.SIGNED,
        clinic: { name: 'Clinica Vet' },
        pet: { name: 'Bidu', client: { name: 'John Doe' } },
      };
      mockPrisma.consentTerm.findFirst.mockResolvedValue(mockConsentTerm);

      const result = await controller.getDetails(hash);
      expect(result).toBeDefined();
      expect(result.documentType).toBe('TERMO_DE_CONSENTIMENTO');
      expect(result.document).toEqual(mockConsentTerm);
    });

    it('throws NotFoundException if no signed document corresponds to the hash', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValue(null);
      mockPrisma.consentTerm.findFirst.mockResolvedValue(null);

      await expect(controller.getDetails(hash)).rejects.toThrow(NotFoundException);
    });
  });

  describe('tutorSign', () => {
    const hash = 'a6c8e31...';
    const body = { name: 'Maria Silva', cpf: '111.444.777-35' };

    it('calls consentTermsService.tutorSign with parameters', async () => {
      mockConsentTermsService.tutorSign.mockResolvedValue({ id: 'term-1', tutorSigned: true });

      const req = { headers: { 'x-forwarded-for': '192.168.0.1' }, socket: {} };
      const result = await controller.tutorSign(hash, body, '127.0.0.1', 'Mozilla/5.0', req);

      expect(mockConsentTermsService.tutorSign).toHaveBeenCalledWith(hash, {
        name: body.name,
        cpf: body.cpf,
        ip: '192.168.0.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(result).toBeDefined();
      expect(result.tutorSigned).toBe(true);
    });
  });
});
