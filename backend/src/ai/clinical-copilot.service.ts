import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';
import { PromptSanitizerService } from './prompt-sanitizer.service';
import { AnamnesisPromptDto } from './dto/anamnesis-prompt.dto';

export interface DifferentialDiagnosisItem {
  name: string;
  cidV: string;
  probability: 'ALTA' | 'MEDIA' | 'BAIXA';
  justification: string;
}

export interface RecommendedExamItem {
  name: string;
  priority: 'ESSENCIAL' | 'COMPLEMENTAR';
  reason: string;
}

export interface ClinicalCopilotResult {
  success: boolean;
  source: 'GROQ_AI' | 'FALLBACK';
  summary: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  differentialDiagnoses: DifferentialDiagnosisItem[];
  recommendedExams: RecommendedExamItem[];
  riskAlerts: string[];
  suggestedConduct: string[];
}

@Injectable()
export class ClinicalCopilotService {
  private readonly logger = new Logger(ClinicalCopilotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqService,
    private readonly promptSanitizer: PromptSanitizerService,
  ) {}

  /**
   * Avalia os sintomas relatados e histórico do paciente, acionando o Groq LLM
   * com pseudonimização obrigatória e conformidade com LGPD.
   */
  async generateDifferentialDiagnosis(
    clinicId: string,
    dto: AnamnesisPromptDto,
  ): Promise<ClinicalCopilotResult> {
    // 1. Busca dados do pet com isolamento de tenant
    const pet = await this.prisma.pet.findFirst({
      where: { id: dto.petId, clinicId },
      include: {
        client: { select: { id: true, name: true } },
        allergies: { select: { name: true } },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { weight: true },
        },
        clinicalRecords: {
          orderBy: { date: 'desc' },
          take: 3,
          select: { content: true, title: true, type: true },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    const latestWeight = pet.weightRecords[0]?.weight ?? null;
    const allergiesList = pet.allergies.map((a) => a.name);
    const recentHistoryText = pet.clinicalRecords
      .map((r) => `[${r.type}] ${r.title || ''}: ${r.content}`)
      .join(' | ');


    // 2. Sanitização e Pseudonimização Obrigatória (LGPD)
    const sanitized = this.promptSanitizer.sanitizeAnamnesisContext({
      clientId: pet.client.id,
      clientName: pet.client.name,
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageYears: pet.age,
      weightKg: latestWeight,
      allergies: allergiesList,
      symptoms: dto.symptoms,
      clinicalHistory: `${dto.additionalNotes || ''} ${recentHistoryText}`,
    });

    // 3. Montagem do prompt para o modelo Llama 3.1
    const systemPrompt = `Você é um Médico Veterinário Especialista em Diagnóstico Diferencial e Medicina Interna Veterinária de Cães, Gatos e Pequenos Animais.
Sua missão é auxiliar o veterinário clínico examinador, sugerindo diagnósticos diferenciais fundamentados na literatura técnica e correlacionados aos códigos da Classificação Internacional de Doenças Veterinárias (CID-V).
Responda EXCLUSIVAMENTE em formato JSON com o seguinte schema:
{
  "summary": "Resumo clínico suscinto do quadro",
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "differentialDiagnoses": [
    {
      "name": "Nome da patologia",
      "cidV": "Código CID-V (ex: CID-V K29.0 ou classificação veterinária correspondente)",
      "probability": "ALTA" | "MEDIA" | "BAIXA",
      "justification": "Por que esta hipótese clínica se aplica aos sinais"
    }
  ],
  "recommendedExams": [
    {
      "name": "Nome do exame (ex: Hemograma completo, Perfil bioquímico renal/hepático)",
      "priority": "ESSENCIAL" | "COMPLEMENTAR",
      "reason": "O que avaliar ou descartar"
    }
  ],
  "riskAlerts": ["Alertas de risco para a espécie/idade ou contraindicações"],
  "suggestedConduct": ["Ações imediatas e condutas de suporte sugeridas"]
}`;

    const userPrompt = `DADOS DO PACIENTE (PSEUDONIMIZADOS):
- Identificador: ${sanitized.patientRef}
- Espécie: ${sanitized.species}
- Raça: ${sanitized.breed}
- Idade: ${sanitized.ageYears ? `${sanitized.ageYears} anos` : 'Não informada'}
- Peso atual: ${sanitized.weightKg ? `${sanitized.weightKg} kg` : 'Não aferido'}
- Alergias conhecidas: ${sanitized.allergies.length > 0 ? sanitized.allergies.join(', ') : 'Nenhuma relatada'}
- Histórico clínico pregresso: ${sanitized.sanitizedClinicalHistory || 'Sem registros relevantes'}

SINAIS CLÍNICOS E SINTOMAS APRESENTADOS:
${sanitized.sanitizedSymptoms}

Por favor, forneça as hipóteses diagnósticas CID-V, exames sugeridos e condutas recomendadas.`;

    // 4. Chamada resiliente ao Groq
    const rawResponse = await this.groqService.chatCompletion(
      {
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        responseFormat: { type: 'json_object' },
        temperature: 0.2,
      },
      clinicId,
    );

    // 5. Validação estrutural do retorno
    const parsed = this.promptSanitizer.validateJsonResponse<any>(
      rawResponse,
      (obj) =>
        Array.isArray(obj.differentialDiagnoses) &&
        Array.isArray(obj.recommendedExams) &&
        Array.isArray(obj.suggestedConduct),
    );

    if (parsed) {
      return {
        success: true,
        source: 'GROQ_AI',
        summary: parsed.summary || 'Análise clínica baseada nos sintomas informados.',
        urgencyLevel: parsed.urgencyLevel || 'MEDIUM',
        differentialDiagnoses: parsed.differentialDiagnoses,
        recommendedExams: parsed.recommendedExams,
        riskAlerts: parsed.riskAlerts || [],
        suggestedConduct: parsed.suggestedConduct,
      };
    }

    // 6. Fallback Gracioso (Caso a IA esteja indisponível ou sem chave)
    this.logger.warn(
      `Acionando fallback estruturado para anamnese do pet ${dto.petId} (Groq indisponível ou timeout).`,
    );

    return {
      success: true,
      source: 'FALLBACK',
      summary:
        'Não foi possível conectar ao motor de IA no momento. Apresentando diretrizes clínicas básicas.',
      urgencyLevel: 'MEDIUM',
      differentialDiagnoses: [
        {
          name: 'Avaliação clínica presencial requerida',
          cidV: 'CID-V R69',
          probability: 'ALTA',
          justification:
            'Sintomas necessitam de correlação com exame físico e palpação.',
        },
      ],
      recommendedExams: [
        {
          name: 'Hemograma completo + Plaquetas',
          priority: 'ESSENCIAL',
          reason: 'Triagem básica de inflamação/infecção.',
        },
      ],
      riskAlerts: [
        'Motor de IA temporariamente em modo offline. O atendimento prossegue normalmente.',
      ],
      suggestedConduct: [
        'Realizar anamnese aprofundada',
        'Aferir parâmetros vitais (Temperatura, TPC, Frequência Cardíaca e Respiratória)',
      ],
    };
  }
}
