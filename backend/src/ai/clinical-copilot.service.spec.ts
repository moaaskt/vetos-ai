import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClinicalCopilotService } from './clinical-copilot.service';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';
import { PromptSanitizerService } from './prompt-sanitizer.service';

describe('ClinicalCopilotService', () => {
  let service: ClinicalCopilotService;
  let prismaService: jest.Mocked<PrismaService>;
  let groqService: jest.Mocked<GroqService>;
  let promptSanitizer: PromptSanitizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalCopilotService,
        PromptSanitizerService,
        {
          provide: PrismaService,
          useValue: {
            pet: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: GroqService,
          useValue: {
            chatCompletion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClinicalCopilotService>(ClinicalCopilotService);
    prismaService = module.get(PrismaService);
    groqService = module.get(GroqService);
    promptSanitizer = module.get(PromptSanitizerService);
  });

  it('deve lançar NotFoundException se o pet não existir para a clínica', async () => {
    (prismaService.pet.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.generateDifferentialDiagnosis('clinic-1', {
        petId: 'pet-not-found',
        symptoms: 'Vômito e apatia',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve gerar diagnósticos diferenciais via Groq com sucesso', async () => {
    (prismaService.pet.findFirst as jest.Mock).mockResolvedValue({
      id: 'pet-1',
      name: 'Bob',
      species: 'Canina',
      breed: 'Beagle',
      age: 3,
      client: { id: 'client-1', name: 'Juliana Paes' },
      allergies: [{ name: 'Frango' }],
      weightRecords: [{ weight: 14.2 }],
      clinicalRecords: [],

    });

    const mockAiResponse = JSON.stringify({
      summary: 'Quadro sugestivo de gastroenterite aguda.',
      urgencyLevel: 'MEDIUM',
      differentialDiagnoses: [
        {
          name: 'Gastroenterite Dietética',
          cidV: 'CID-V K52.9',
          probability: 'ALTA',
          justification: 'Início súbito de vômitos após ingestão de alimento estranho.',
        },
      ],
      recommendedExams: [
        {
          name: 'Hemograma completo',
          priority: 'ESSENCIAL',
          reason: 'Verificar leucocitose.',
        },
      ],
      riskAlerts: ['Evitar alimentos com frango devido a histórico alérgico.'],
      suggestedConduct: ['Hidratação oral e antiemético.'],
    });

    groqService.chatCompletion.mockResolvedValue(mockAiResponse);

    const result = await service.generateDifferentialDiagnosis('clinic-1', {
      petId: 'pet-1',
      symptoms: 'Vômito alimentar após mexer no lixo.',
    });

    expect(result.success).toBe(true);
    expect(result.source).toBe('GROQ_AI');
    expect(result.differentialDiagnoses[0].name).toBe('Gastroenterite Dietética');
    expect(result.recommendedExams[0].name).toBe('Hemograma completo');
    expect(groqService.chatCompletion).toHaveBeenCalled();
  });

  it('deve retornar resultado de fallback seguro caso a chamada ao Groq falhe ou expire', async () => {
    (prismaService.pet.findFirst as jest.Mock).mockResolvedValue({
      id: 'pet-1',
      name: 'Bob',
      species: 'Canina',
      breed: 'Beagle',
      age: 3,
      client: { id: 'client-1', name: 'Juliana' },
      allergies: [],
      weightRecords: [],
      clinicalRecords: [],
    });

    groqService.chatCompletion.mockResolvedValue(null); // Simula timeout ou erro

    const result = await service.generateDifferentialDiagnosis('clinic-1', {
      petId: 'pet-1',
      symptoms: 'Tosse seca',
    });

    expect(result.success).toBe(true);
    expect(result.source).toBe('FALLBACK');
    expect(result.differentialDiagnoses.length).toBeGreaterThan(0);
    expect(result.recommendedExams.length).toBeGreaterThan(0);
  });
});
