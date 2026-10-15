import { Injectable, Logger } from '@nestjs/common';

export interface AnamnesisSanitizationInput {
  clientId: string;
  clientName?: string;
  petId: string;
  petName?: string;
  species: string;
  breed?: string | null;
  ageYears?: number | null;
  weightKg?: number | null;
  allergies?: string[];
  symptoms: string;
  clinicalHistory?: string;
}

export interface SanitizedAnamnesisPrompt {
  patientRef: string;
  tutorRef: string;
  species: string;
  breed: string;
  ageYears: number | null;
  weightKg: number | null;
  allergies: string[];
  sanitizedSymptoms: string;
  sanitizedClinicalHistory: string;
}

export interface ReengagementSanitizationInput {
  clientId: string;
  clientName?: string;
  petId: string;
  petName?: string;
  species: string;
  breed?: string | null;
  daysInactive: number;
  lastVisitReason?: string | null;
}

export interface SanitizedReengagementPrompt {
  tutorRef: string;
  patientRef: string;
  species: string;
  breed: string;
  daysInactive: number;
  sanitizedLastVisitReason: string;
}

@Injectable()
export class PromptSanitizerService {
  private readonly logger = new Logger(PromptSanitizerService.name);

  // Regex para detecção e remoção de dados pessoais sensíveis (PII)
  private readonly EMAIL_REGEX =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  private readonly CPF_REGEX =
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
  private readonly PHONE_REGEX =
    /(?:\+?55\s?)?(?:\(?0?[1-9]{2}\)?\s?)?(?:9[.\s]?)?\d{4}[-.\s]?\d{4}\b/g;
  private readonly CEP_REGEX =
    /\b\d{5}-?\d{3}\b/g;

  /**
   * Sanitiza qualquer texto livre, removendo PII (nomes, telefones, emails, CPFs).
   */
  sanitizeText(
    text: string,
    clientName?: string,
    petName?: string,
    tutorPlaceholder = 'Tutor #anon',
    petPlaceholder = 'Paciente #anon',
  ): string {
    if (!text) return '';

    let sanitized = text;

    // 1. Substitui nome do tutor caso fornecido
    if (clientName && clientName.trim().length > 1) {
      const escapedClient = this.escapeRegExp(clientName.trim());
      // Substitui variações do nome completo e primeiro nome (se > 2 caracteres)
      sanitized = sanitized.replace(
        new RegExp(`\\b${escapedClient}\\b`, 'gi'),
        tutorPlaceholder,
      );
      const firstName = clientName.trim().split(/\s+/)[0];
      if (firstName && firstName.length > 2) {
        sanitized = sanitized.replace(
          new RegExp(`\\b${this.escapeRegExp(firstName)}\\b`, 'gi'),
          tutorPlaceholder,
        );
      }
    }

    // 2. Substitui nome do pet caso fornecido
    if (petName && petName.trim().length > 1) {
      const escapedPet = this.escapeRegExp(petName.trim());
      sanitized = sanitized.replace(
        new RegExp(`\\b${escapedPet}\\b`, 'gi'),
        petPlaceholder,
      );
    }

    // 3. Remove Telefones
    sanitized = sanitized.replace(this.PHONE_REGEX, '[TELEFONE_REMOVIDO]');

    // 4. Remove E-mails
    sanitized = sanitized.replace(this.EMAIL_REGEX, '[EMAIL_REMOVIDO]');

    // 5. Remove CPFs
    sanitized = sanitized.replace(this.CPF_REGEX, '[CPF_REMOVIDO]');

    // 6. Remove CEPs
    sanitized = sanitized.replace(this.CEP_REGEX, '[CEP_REMOVIDO]');

    return sanitized;
  }

  /**
   * Prepara o contexto de anamnese clínica sem nenhuma informação pessoal do tutor ou pet.
   */
  sanitizeAnamnesisContext(
    input: AnamnesisSanitizationInput,
  ): SanitizedAnamnesisPrompt {
    const tutorRef = `Tutor #${this.hashId(input.clientId)}`;
    const patientRef = `Paciente #${this.hashId(input.petId)}`;

    const sanitizedSymptoms = this.sanitizeText(
      input.symptoms,
      input.clientName,
      input.petName,
      tutorRef,
      patientRef,
    );

    const sanitizedClinicalHistory = this.sanitizeText(
      input.clinicalHistory || '',
      input.clientName,
      input.petName,
      tutorRef,
      patientRef,
    );

    const allergies = (input.allergies || []).map((allergy) =>
      this.sanitizeText(
        allergy,
        input.clientName,
        input.petName,
        tutorRef,
        patientRef,
      ),
    );

    return {
      tutorRef,
      patientRef,
      species: input.species || 'Canina',
      breed: input.breed || 'Não informada / SRD',
      ageYears: input.ageYears ?? null,
      weightKg: input.weightKg ?? null,
      allergies,
      sanitizedSymptoms,
      sanitizedClinicalHistory,
    };
  }

  /**
   * Prepara o contexto de reengajamento de cliente sem dados confidenciais.
   */
  sanitizeReengagementContext(
    input: ReengagementSanitizationInput,
  ): SanitizedReengagementPrompt {
    const tutorRef = `Tutor #${this.hashId(input.clientId)}`;
    const patientRef = `Paciente #${this.hashId(input.petId)}`;

    const sanitizedLastVisitReason = this.sanitizeText(
      input.lastVisitReason || 'Consulta de rotina',
      input.clientName,
      input.petName,
      tutorRef,
      patientRef,
    );

    return {
      tutorRef,
      patientRef,
      species: input.species || 'Canina',
      breed: input.breed || 'SRD',
      daysInactive: input.daysInactive,
      sanitizedLastVisitReason,
    };
  }

  /**
   * Valida e sanitiza a resposta JSON retornada pelo LLM.
   */
  validateJsonResponse<T>(
    rawContent: string | null,
    validator?: (parsed: any) => boolean,
  ): T | null {
    if (!rawContent) return null;

    try {
      // Extrai JSON mesmo que venha envolvido em blocos markdown ```json ... ```
      let jsonStr = rawContent.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonStr);

      if (validator && !validator(parsed)) {
        this.logger.warn('Resposta JSON da IA rejeitada pelo validador estrutural.');
        return null;
      }

      return parsed as T;
    } catch (err: any) {
      this.logger.warn(
        `Falha ao parsear saída JSON da IA: ${err.message}. Conteúdo bruto truncado: ${rawContent.slice(0, 150)}`,
      );
      return null;
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private hashId(id: string): string {
    if (!id) return '0000';
    // Retorna os primeiros 6 caracteres alfanuméricos limpos
    return id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  }
}
