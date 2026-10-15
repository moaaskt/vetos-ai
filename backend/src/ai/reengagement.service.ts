import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';
import { PromptSanitizerService } from './prompt-sanitizer.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BillingService } from '../billing/billing.service';

export interface InactiveClientCandidate {
  clientId: string;
  clientName: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  petId: string;
  petName: string;
  species: string;
  breed: string | null;
  daysInactive: number;
  lastVisitDate: Date;
}

export interface ReengagementBatchResult {
  clinicId: string;
  processedCount: number;
  enqueuedCount: number;
  skippedQuotaCount: number;
  errors: string[];
}

@Injectable()
export class ReengagementService {
  private readonly logger = new Logger(ReengagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqService,
    private readonly promptSanitizer: PromptSanitizerService,
    private readonly notificationsService: NotificationsService,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Localiza tutores elegíveis para reengajamento:
   * 1. Sem consultas há mais de 90 dias
   * 2. lastReengagementAt nulo ou superior a 60 dias (evita repetição invasiva)
   * 3. Possui ao menos um pet cadastrado e telefone/whatsapp para contato
   */
  async findInactiveClients(
    clinicId: string,
    limit = 20,
  ): Promise<InactiveClientCandidate[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const candidates: InactiveClientCandidate[] = [];

    // Busca clientes da clínica que não receberam reengajamento recente
    const clients = await this.prisma.client.findMany({
      where: {
        clinicId,
        OR: [
          { lastReengagementAt: null },
          { lastReengagementAt: { lt: sixtyDaysAgo } },
        ],
      },
      include: {
        pets: {
          take: 1,
          select: { id: true, name: true, species: true, breed: true },
        },
        appointments: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true, reason: true },
        },
      },
      take: limit * 2, // Margem para filtragem
    });

    for (const client of clients) {
      if (!client.pets || client.pets.length === 0) continue;
      const primaryPet = client.pets[0];

      const lastAppointment = client.appointments[0];
      // Se tiver consulta recente (< 90 dias), desconsidera
      if (lastAppointment && lastAppointment.date >= ninetyDaysAgo) {
        continue;
      }

      // Define a data de referência (última consulta ou data de cadastro do cliente)
      const referenceDate = lastAppointment
        ? lastAppointment.date
        : client.createdAt;

      // Se o cliente foi criado há menos de 90 dias e não tem consulta, ainda não é inativo
      if (!lastAppointment && referenceDate >= ninetyDaysAgo) {
        continue;
      }

      const diffTime = Math.abs(new Date().getTime() - referenceDate.getTime());
      const daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      candidates.push({
        clientId: client.id,
        clientName: client.name,
        phone: client.phone,
        whatsapp: client.whatsapp,
        email: client.email,
        petId: primaryPet.id,
        petName: primaryPet.name,
        species: primaryPet.species,
        breed: primaryPet.breed,
        daysInactive,
        lastVisitDate: referenceDate,
      });

      if (candidates.length >= limit) break;
    }

    return candidates;
  }

  /**
   * Gera o texto da mensagem de reengajamento via Groq (ou fallback) com pseudonimização.
   */
  async generateReengagementMessage(
    clinicId: string,
    candidate: InactiveClientCandidate,
  ): Promise<string> {
    const sanitized = this.promptSanitizer.sanitizeReengagementContext({
      clientId: candidate.clientId,
      clientName: candidate.clientName,
      petId: candidate.petId,
      petName: candidate.petName,
      species: candidate.species,
      breed: candidate.breed,
      daysInactive: candidate.daysInactive,
      lastVisitReason: 'Avaliação preventiva de rotina',
    });

    const systemPrompt = `Você é o assistente virtual empático e acolhedor de uma clínica veterinária.
Escreva uma mensagem de WhatsApp para reengajar o tutor cujo pet não visita a clínica há ${sanitized.daysInactive} dias.
DIRETRIZES:
1. Seja gentil, profissional e carinhoso(a). Enfatize a importância do check-up preventivo para ${sanitized.species}.
2. Utilize EXATAMENTE as tags {{clientName}} para o nome do tutor e {{petName}} para o nome do pet.
3. Não use linguagem alarmista.
4. Tamanho: 2 a 3 frases curtas ideais para mensagem de WhatsApp.`;

    const rawResponse = await this.groqService.chatCompletion(
      {
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Gere a mensagem de reengajamento para o ${sanitized.patientRef} (Espécie: ${sanitized.species}, Raça: ${sanitized.breed}).`,
          },
        ],
        temperature: 0.6,
        maxTokens: 300,
      },
      clinicId,
    );

    let template = rawResponse?.trim();

    // Fallback gracioso se a IA não responder ou timeout
    if (!template) {
      template =
        'Olá, {{clientName}}! Percebemos que faz um tempinho que o(a) {{petName}} não nos visita para um check-up preventivo. Manter a saúde em dia é o maior gesto de amor! Que tal agendarmos uma avaliação de rotina essa semana?';
    }

    // Injeta os nomes reais no NestJS (Template Engine local - dados nunca foram enviados à Groq)
    const personalizedMessage = template
      .replace(/{{\s*clientName\s*}}/g, candidate.clientName)
      .replace(/{{\s*petName\s*}}/g, candidate.petName);

    return personalizedMessage;
  }

  /**
   * Processa um lote de reengajamento para uma clínica específica, respeitando as cotas do SaaS.
   */
  async processClinicReengagementBatch(
    clinicId: string,
    limit = 10,
  ): Promise<ReengagementBatchResult> {
    const result: ReengagementBatchResult = {
      clinicId,
      processedCount: 0,
      enqueuedCount: 0,
      skippedQuotaCount: 0,
      errors: [],
    };

    const candidates = await this.findInactiveClients(clinicId, limit);
    result.processedCount = candidates.length;

    for (const candidate of candidates) {
      try {
        // Validação obrigatória de cotas da clínica
        await this.billingService.assertCanSendNotification(clinicId);
      } catch (quotaError: any) {
        this.logger.warn(
          `Cota de notificações esgotada para a clínica ${clinicId}. Interrompendo lote de reengajamento: ${quotaError.message}`,
        );
        result.skippedQuotaCount += candidates.length - result.enqueuedCount;
        break;
      }

      const destinationPhone = candidate.whatsapp || candidate.phone;
      if (!destinationPhone && !candidate.email) {
        continue;
      }

      try {
        const messageBody = await this.generateReengagementMessage(
          clinicId,
          candidate,
        );

        const channel = destinationPhone ? 'WHATSAPP' : 'EMAIL';
        const target = destinationPhone || candidate.email!;

        await this.notificationsService.enqueueNotification({
          clinicId,
          channel,
          to: target,
          body: messageBody,
          subject: `Sentimos sua falta! Como está o(a) ${candidate.petName}?`,
          event: 'RETENTION',
          clientId: candidate.clientId,
          petId: candidate.petId,
          clientName: candidate.clientName,
          petName: candidate.petName,
        });

        // Grava marco para evitar reenvio em menos de 60 dias
        await this.prisma.client.update({
          where: { id: candidate.clientId },
          data: { lastReengagementAt: new Date() },
        });

        result.enqueuedCount++;
      } catch (err: any) {
        this.logger.error(
          `Erro ao processar reengajamento para o cliente ${candidate.clientId}: ${err.message}`,
        );
        result.errors.push(err.message);
      }
    }

    return result;
  }

  /**
   * Varre todas as clínicas ativas do sistema para executar o lote de retenção.
   */
  async processAllClinicsReengagement(): Promise<void> {
    this.logger.log('Iniciando processamento semanal de reengajamento de tutores inativos...');
    const clinics = await this.prisma.clinic.findMany({
      select: { id: true, name: true },
    });

    for (const clinic of clinics) {
      try {
        const batch = await this.processClinicReengagementBatch(clinic.id, 10);
        if (batch.enqueuedCount > 0) {
          this.logger.log(
            `Clínica ${clinic.name} (${clinic.id}): ${batch.enqueuedCount} mensagens de reengajamento enfileiradas.`,
          );
        }
      } catch (err: any) {
        this.logger.error(
          `Falha ao processar reengajamento da clínica ${clinic.id}: ${err.message}`,
        );
      }
    }
  }
}
