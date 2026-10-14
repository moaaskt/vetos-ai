import { Test, TestingModule } from '@nestjs/testing';
import { TutorProfileService } from './tutor-profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TutorProfileService', () => {
  let service: TutorProfileService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorProfileService,
        {
          provide: PrismaService,
          useValue: {
            tutorIdentity: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'tutor-id-1') {
                  return Promise.resolve({
                    id: 'tutor-id-1',
                    publicId: 'TUT-ABCD',
                    name: 'João Silva',
                    primaryEmail: 'joao.silva@demo.com',
                    primaryWhatsapp: '(11) 98888-7777',
                    preferredChannel: 'EMAIL',
                    locale: 'pt-BR',
                    timezone: 'America/Sao_Paulo',
                    cpf: '12345678900',
                  });
                }
                return Promise.resolve(null);
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TutorProfileService>(TutorProfileService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve retornar perfil com CPF devidamente mascarado', async () => {
    const profile = await service.getProfile('tutor-id-1');
    expect(profile).toBeDefined();
    expect(profile.name).toBe('João Silva');
    expect(profile.cpf).toBe('***.456.789-**');
  });

  it('deve lançar NotFoundException para tutor inexistente', async () => {
    await expect(service.getProfile('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
