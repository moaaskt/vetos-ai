import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve normalizar e salvar CPF nulo se enviado vazio', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      mockPrismaService.client.create.mockResolvedValue({ id: '1', name: 'Tutor', cpf: null });

      const result = await service.create('clinic-1', { name: 'Tutor', cpf: '   ' });
      expect(result.cpf).toBeNull();
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ cpf: null, clinicId: 'clinic-1' }),
      });
    });

    it('deve rejeitar CPF invalido', async () => {
      await expect(service.create('clinic-1', { name: 'Tutor', cpf: '12345678900' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve rejeitar CPF duplicado no mesmo tenant', async () => {
      // CPF válido mockado
      const validCpf = '24711252207';
      mockPrismaService.client.findFirst.mockResolvedValue({ id: 'existing', cpf: validCpf });

      await expect(service.create('clinic-1', { name: 'Tutor', cpf: validCpf })).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
