import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { ClinicalCopilotService } from './clinical-copilot.service';
import { NoShowPredictorService } from './no-show-predictor.service';
import { ReengagementService } from './reengagement.service';

describe('AiController', () => {
  let controller: AiController;
  let clinicalCopilot: jest.Mocked<ClinicalCopilotService>;
  let noShowPredictor: jest.Mocked<NoShowPredictorService>;
  let reengagementService: jest.Mocked<ReengagementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: ClinicalCopilotService,
          useValue: {
            generateDifferentialDiagnosis: jest.fn(),
          },
        },
        {
          provide: NoShowPredictorService,
          useValue: {
            predictForAppointment: jest.fn(),
          },
        },
        {
          provide: ReengagementService,
          useValue: {
            findInactiveClients: jest.fn(),
            processClinicReengagementBatch: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    clinicalCopilot = module.get(ClinicalCopilotService);
    noShowPredictor = module.get(NoShowPredictorService);
    reengagementService = module.get(ReengagementService);
  });

  it('deve chamar o copilot clínico com clinicId do usuário', async () => {
    clinicalCopilot.generateDifferentialDiagnosis.mockResolvedValue({
      success: true,
      source: 'GROQ_AI',
      summary: 'Resumo',
      urgencyLevel: 'LOW',
      differentialDiagnoses: [],
      recommendedExams: [],
      riskAlerts: [],
      suggestedConduct: [],
    });

    const user = { clinicId: 'clinic-123' };
    const dto = { petId: 'pet-1', symptoms: 'Vômito' };

    const result = await controller.suggestDiagnosis(user, dto);

    expect(clinicalCopilot.generateDifferentialDiagnosis).toHaveBeenCalledWith(
      'clinic-123',
      dto,
    );
    expect(result.success).toBe(true);
  });

  it('deve chamar o preditor de no-show para um agendamento', async () => {
    noShowPredictor.predictForAppointment.mockResolvedValue({
      score: 25,
      level: 'LOW',
      explanation: 'Baixo risco',
      recommendation: 'Lembrete padrão',
      stats: {
        totalPastAppointments: 2,
        noShowCount: 0,
        cancelledCount: 0,
        completedCount: 2,
        absenceRatePercentage: 0,
      },
    });

    const user = { clinicId: 'clinic-123' };
    const result = await controller.getNoShowRisk(user, 'app-456');

    expect(noShowPredictor.predictForAppointment).toHaveBeenCalledWith(
      'app-456',
      'clinic-123',
    );
    expect(result.level).toBe('LOW');
  });

  it('deve listar candidatos de reengajamento', async () => {
    reengagementService.findInactiveClients.mockResolvedValue([]);

    const user = { clinicId: 'clinic-123' };
    const result = await controller.getReengagementCandidates(user, '15');

    expect(reengagementService.findInactiveClients).toHaveBeenCalledWith(
      'clinic-123',
      15,
    );
    expect(result).toEqual([]);
  });

  it('deve disparar lote de reengajamento', async () => {
    reengagementService.processClinicReengagementBatch.mockResolvedValue({
      clinicId: 'clinic-123',
      processedCount: 5,
      enqueuedCount: 5,
      skippedQuotaCount: 0,
      errors: [],
    });

    const user = { clinicId: 'clinic-123' };
    const result = await controller.triggerReengagementBatch(user, '10');

    expect(
      reengagementService.processClinicReengagementBatch,
    ).toHaveBeenCalledWith('clinic-123', 10);
    expect(result.enqueuedCount).toBe(5);
  });
});
