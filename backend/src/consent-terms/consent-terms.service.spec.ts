import { Test, TestingModule } from '@nestjs/testing';
import { ConsentTermsService } from './consent-terms.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

describe('ConsentTermsService', () => {
  let service: ConsentTermsService;
  let notificationsService: NotificationsService;

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
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationsService = {
    enqueueNotification: jest.fn(),
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
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ConsentTermsService>(ConsentTermsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
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

  describe('share', () => {
    it('shares a signed consent term successfully', async () => {
      const mockDoc = {
        id: 'term-1',
        clinicId: 'clinic-1',
        petId: 'pet-1',
        status: DocumentStatus.SIGNED,
        documentHash: 'some-hash',
        pet: {
          id: 'pet-1',
          name: 'Rex',
          clientId: 'client-1',
          client: {
            id: 'client-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123456789',
          },
        },
        clinic: {
          id: 'clinic-1',
          name: 'Clinic Vet',
        },
      };

      mockPrisma.consentTerm.findFirst.mockResolvedValue(mockDoc);
      mockPrisma.consentTerm.update.mockResolvedValue({ ...mockDoc, lastSharedAt: new Date() });

      const result = await service.share('clinic-1', 'term-1', ['EMAIL', 'WHATSAPP']);
      expect(result).toEqual({ success: true });
      expect(mockNotificationsService.enqueueNotification).toHaveBeenCalledTimes(2);
      expect(mockPrisma.consentTerm.update).toHaveBeenCalledWith({
        where: { id: 'term-1' },
        data: { lastSharedAt: expect.any(Date) },
      });
    });

    it('throws BadRequestException if document is DRAFT', async () => {
      mockPrisma.consentTerm.findFirst.mockResolvedValue({
        id: 'term-1',
        clinicId: 'clinic-1',
        status: DocumentStatus.DRAFT,
      });

      await expect(service.share('clinic-1', 'term-1', ['EMAIL'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException if term does not exist', async () => {
      mockPrisma.consentTerm.findFirst.mockResolvedValue(null);

      await expect(service.share('clinic-1', 'term-1', ['EMAIL'])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('tutorSign', () => {
    const hash = 'term-hash';
    const data = { name: 'Maria Silva', cpf: '111.444.777-35', ip: '192.168.0.1', userAgent: 'Mozilla/5.0' };

    it('successfully signs a consent term as tutor', async () => {
      const mockDoc = { id: 'term-1', documentHash: hash, status: DocumentStatus.SIGNED, tutorSigned: false };
      mockPrisma.consentTerm.findUnique.mockResolvedValue(mockDoc);
      mockPrisma.consentTerm.update.mockImplementation(({ data: updateData }) => ({
        ...mockDoc,
        ...updateData,
      }));

      const result = await service.tutorSign(hash, data);
      expect(result.tutorSigned).toBe(true);
      expect(result.tutorSignatureName).toBe(data.name);
      expect(result.tutorSignatureCpf).toBe(data.cpf);
      expect(result.tutorSignatureIp).toBe(data.ip);
      expect(result.tutorSignatureUserAgent).toBe(data.userAgent);
      expect(result.tutorSignedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundException if term does not exist', async () => {
      mockPrisma.consentTerm.findUnique.mockResolvedValue(null);

      await expect(service.tutorSign(hash, data)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if term is in DRAFT', async () => {
      mockPrisma.consentTerm.findUnique.mockResolvedValue({ id: 'term-1', status: DocumentStatus.DRAFT, tutorSigned: false });

      await expect(service.tutorSign(hash, data)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if term is already signed by tutor', async () => {
      mockPrisma.consentTerm.findUnique.mockResolvedValue({ id: 'term-1', status: DocumentStatus.SIGNED, tutorSigned: true });

      await expect(service.tutorSign(hash, data)).rejects.toThrow(BadRequestException);
    });
  });
});
