import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { PrismaService } from '../prisma/prisma.service';
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
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
});
