import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalAttachmentsService } from './clinical-attachments.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';

describe('ClinicalAttachmentsService', () => {
  let service: ClinicalAttachmentsService;

  const prismaMock = {
    pet: {
      findFirst: jest.fn(),
    },
    clinicalRecord: {
      findFirst: jest.fn(),
    },
    clinicalAttachment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  const storageMock = {
    save: jest.fn(),
    delete: jest.fn(),
    getFileStream: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalAttachmentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();

    service = module.get<ClinicalAttachmentsService>(ClinicalAttachmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const fileMock = {
      originalname: 'exame_sangue.webp',
      mimetype: 'image/webp',
      size: 1024,
      buffer: Buffer.from('webp-content'),
    };

    it('should successfully upload and register metadata', async () => {
      prismaMock.pet.findFirst.mockResolvedValue({ id: 'pet-1', clinicId: 'clinic-1' });
      storageMock.save.mockResolvedValue('clinics/clinic-1/pets/pet-1/random-uuid.webp');
      prismaMock.clinicalAttachment.create.mockResolvedValue({
        id: 'att-1',
        clinicId: 'clinic-1',
        petId: 'pet-1',
        originalFileName: 'exame_sangue.webp',
        storedFileName: 'random-uuid.webp',
        mimeType: 'image/webp',
        fileSize: BigInt(1024),
        storagePath: 'clinics/clinic-1/pets/pet-1/random-uuid.webp',
      });

      const result = await service.create('clinic-1', 'pet-1', fileMock, 'user-1', undefined, 'Nota de exame');

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: { id: 'pet-1', clinicId: 'clinic-1' },
      });
      expect(storageMock.save).toHaveBeenCalled();
      expect(prismaMock.clinicalAttachment.create).toHaveBeenCalled();
      expect(result.originalFileName).toBe('exame_sangue.webp');
    });

    it('should throw NotFoundException if pet does not belong to clinic', async () => {
      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(
        service.create('clinic-wrong', 'pet-1', fileMock, 'user-1')
      ).rejects.toThrow(NotFoundException);

      expect(storageMock.save).not.toHaveBeenCalled();
      expect(prismaMock.clinicalAttachment.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByPet', () => {
    it('should return all attachments for a pet with converted fileSize', async () => {
      prismaMock.pet.findFirst.mockResolvedValue({ id: 'pet-1', clinicId: 'clinic-1' });
      prismaMock.clinicalAttachment.findMany.mockResolvedValue([
        {
          id: 'att-1',
          clinicId: 'clinic-1',
          petId: 'pet-1',
          originalFileName: 'laudo.pdf',
          fileSize: BigInt(512),
        },
      ]);

      const results = await service.findAllByPet('clinic-1', 'pet-1');

      expect(results).toHaveLength(1);
      expect(results[0].fileSize).toBe(512); // Convertido para number
    });
  });

  describe('getDownloadStream', () => {
    it('should retrieve a readable file stream for owner clinic', async () => {
      const mockStream = new Readable();
      prismaMock.clinicalAttachment.findFirst.mockResolvedValue({
        id: 'att-1',
        clinicId: 'clinic-1',
        mimeType: 'application/pdf',
        originalFileName: 'laudo.pdf',
        storagePath: 'clinics/clinic-1/pets/pet-1/laudo.pdf',
      });
      storageMock.getFileStream.mockResolvedValue(mockStream);

      const result = await service.getDownloadStream('clinic-1', 'att-1');

      expect(result.stream).toBe(mockStream);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should throw NotFoundException if attachment not found or clinic mismatch', async () => {
      prismaMock.clinicalAttachment.findFirst.mockResolvedValue(null);

      await expect(
        service.getDownloadStream('clinic-wrong', 'att-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete file physically and clean database metadata', async () => {
      prismaMock.clinicalAttachment.findFirst.mockResolvedValue({
        id: 'att-1',
        clinicId: 'clinic-1',
        storagePath: 'clinics/clinic-1/pets/pet-1/laudo.pdf',
      });

      const result = await service.remove('clinic-1', 'att-1');

      expect(storageMock.delete).toHaveBeenCalledWith('clinics/clinic-1/pets/pet-1/laudo.pdf');
      expect(prismaMock.clinicalAttachment.delete).toHaveBeenCalledWith({
        where: { id: 'att-1' },
      });
      expect(result.success).toBe(true);
    });
  });
});
