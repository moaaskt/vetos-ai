import { Test, TestingModule } from '@nestjs/testing';
import { TutorPetsService } from './tutor-pets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TutorPetsService', () => {
  let service: TutorPetsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorPetsService,
        {
          provide: PrismaService,
          useValue: {
            pet: {
              findMany: jest.fn().mockResolvedValue([
                { id: 'pet-1', name: 'Max', species: 'Canina' },
              ]),
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'pet-1') {
                  return Promise.resolve({
                    id: 'pet-1',
                    name: 'Max',
                    species: 'Canina',
                    clinic: { name: 'Clínica Alfa' },
                  });
                }
                return Promise.resolve(null);
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TutorPetsService>(TutorPetsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve listar apenas pets permitidos no allowedPetIds', async () => {
    const pets = await service.getPets(['pet-1']);
    expect(pets).toBeDefined();
    expect(pets.length).toBe(1);
    expect(pets[0].id).toBe('pet-1');
  });

  it('deve retornar array vazio se allowedPetIds for vazio sem consultar banco', async () => {
    const pets = await service.getPets([]);
    expect(pets).toEqual([]);
    expect(prisma.pet.findMany).not.toHaveBeenCalled();
  });

  it('deve retornar detalhes do pet quando id estiver em allowedPetIds', async () => {
    const pet = await service.getPetDetails('pet-1', ['pet-1', 'pet-2']);
    expect(pet).toBeDefined();
    expect(pet.id).toBe('pet-1');
  });

  it('deve lançar NotFoundException e bloquear acesso se pet não pertencer ao tutor', async () => {
    await expect(service.getPetDetails('pet-outro-tutor', ['pet-1'])).rejects.toThrow(
      NotFoundException,
    );
  });
});
