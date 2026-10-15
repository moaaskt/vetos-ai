import { Test, TestingModule } from '@nestjs/testing';
import { PromptSanitizerService } from './prompt-sanitizer.service';

describe('PromptSanitizerService', () => {
  let service: PromptSanitizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptSanitizerService],
    }).compile();

    service = module.get<PromptSanitizerService>(PromptSanitizerService);
  });

  describe('sanitizeText', () => {
    it('deve substituir o nome do tutor e do pet por marcadores anônimos', () => {
      const rawText =
        'O tutor Carlos Eduardo trouxe o Rex hoje porque o Rex está vomitando.';
      const sanitized = service.sanitizeText(
        rawText,
        'Carlos Eduardo',
        'Rex',
        'Tutor #123',
        'Paciente #456',
      );

      expect(sanitized).not.toContain('Carlos Eduardo');
      expect(sanitized).not.toContain('Carlos');
      expect(sanitized).not.toContain('Rex');
      expect(sanitized).toContain('Tutor #123');
      expect(sanitized).toContain('Paciente #456');
    });

    it('deve mascarar telefones, e-mails e CPFs presentes no texto', () => {
      const rawText =
        'Contato de emergência: (11) 98877-6655, email tutor@vetos.com.br e CPF 123.456.789-00.';
      const sanitized = service.sanitizeText(rawText);

      expect(sanitized).not.toContain('98877-6655');
      expect(sanitized).not.toContain('tutor@vetos.com.br');
      expect(sanitized).not.toContain('123.456.789-00');
      expect(sanitized).toContain('[TELEFONE_REMOVIDO]');
      expect(sanitized).toContain('[EMAIL_REMOVIDO]');
      expect(sanitized).toContain('[CPF_REMOVIDO]');
    });
  });

  describe('sanitizeAnamnesisContext', () => {
    it('deve gerar um contexto clínico estritamente pseudonimizado', () => {
      const input = {
        clientId: 'client-uuid-999',
        clientName: 'Mariana Silva',
        petId: 'pet-uuid-888',
        petName: 'Thor',
        species: 'Canina',
        breed: 'Golden Retriever',
        ageYears: 4,
        weightKg: 32.5,
        allergies: ['Alergia a dipirona informada por Mariana'],
        symptoms: 'Thor apresenta tosse persistente desde ontem.',
        clinicalHistory: 'Mariana relatou histórico de pneumonia no Thor em 2024.',
      };

      const result = service.sanitizeAnamnesisContext(input);

      expect(result.tutorRef).toMatch(/^Tutor #[A-Z0-9]+$/);
      expect(result.patientRef).toMatch(/^Paciente #[A-Z0-9]+$/);
      expect(result.species).toBe('Canina');
      expect(result.breed).toBe('Golden Retriever');
      expect(result.ageYears).toBe(4);
      expect(result.weightKg).toBe(32.5);

      // Verificação de ausência total de PII
      expect(result.sanitizedSymptoms).not.toContain('Thor');
      expect(result.sanitizedSymptoms).not.toContain('Mariana');
      expect(result.sanitizedClinicalHistory).not.toContain('Thor');
      expect(result.sanitizedClinicalHistory).not.toContain('Mariana');
      expect(result.allergies[0]).not.toContain('Mariana');
    });
  });

  describe('sanitizeReengagementContext', () => {
    it('deve pseudonimizar os dados para mensagens de reengajamento', () => {
      const input = {
        clientId: 'client-12345',
        clientName: 'Roberto Carlos',
        petId: 'pet-67890',
        petName: 'Mel',
        species: 'Felina',
        breed: 'Siamês',
        daysInactive: 120,
        lastVisitReason: 'Mel veio com Roberto para vacinação anual.',
      };

      const result = service.sanitizeReengagementContext(input);

      expect(result.sanitizedLastVisitReason).not.toContain('Mel');
      expect(result.sanitizedLastVisitReason).not.toContain('Roberto');
      expect(result.daysInactive).toBe(120);
      expect(result.species).toBe('Felina');
    });
  });

  describe('validateJsonResponse', () => {
    it('deve parsear JSON válido diretamente', () => {
      const json = '{"diagnostico": "Gastrite", "urgencia": "BAIXA"}';
      const parsed = service.validateJsonResponse<{ diagnostico: string }>(json);

      expect(parsed).toEqual({ diagnostico: 'Gastrite', urgencia: 'BAIXA' });
    });

    it('deve extrair e parsear JSON envolto em blocos markdown', () => {
      const markdownJson =
        '```json\n{"diagnostico": "Otite", "urgencia": "MEDIA"}\n```';
      const parsed =
        service.validateJsonResponse<{ diagnostico: string }>(markdownJson);

      expect(parsed).toEqual({ diagnostico: 'Otite', urgencia: 'MEDIA' });
    });

    it('deve retornar null se o JSON for inválido', () => {
      const invalid = 'Não sou um JSON';
      const parsed = service.validateJsonResponse(invalid);

      expect(parsed).toBeNull();
    });

    it('deve rejeitar se o validador customizado retornar false', () => {
      const json = '{"foo": "bar"}';
      const parsed = service.validateJsonResponse(
        json,
        (obj) => Boolean(obj.diagnostico),
      );

      expect(parsed).toBeNull();
    });
  });
});
