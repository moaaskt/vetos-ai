import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

export type NoShowRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NoShowPrediction {
  score: number; // 0 a 100
  level: NoShowRiskLevel;
  explanation: string;
  recommendation: string;
  stats: {
    totalPastAppointments: number;
    noShowCount: number;
    cancelledCount: number;
    completedCount: number;
    absenceRatePercentage: number;
  };
}

@Injectable()
export class NoShowPredictorService {
  private readonly logger = new Logger(NoShowPredictorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Avalia a probabilidade de falta para um agendamento específico.
   */
  async predictForAppointment(
    appointmentId: string,
    clinicId: string,
  ): Promise<NoShowPrediction> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado nesta clínica.');
    }

    return this.calculateRisk(
      appointment.clientId,
      clinicId,
      appointment.date,
      appointment.createdAt,
    );
  }

  /**
   * Calcula a predição baseada no histórico transacional do cliente na clínica.
   */
  async calculateRisk(
    clientId: string,
    clinicId: string,
    scheduledDate: Date,
    bookedAt: Date = new Date(),
  ): Promise<NoShowPrediction> {
    const pastAppointments = await this.prisma.appointment.findMany({
      where: {
        clientId,
        clinicId,
        date: { lt: new Date() },
      },
      select: {
        id: true,
        status: true,
        date: true,
      },
    });

    const totalPast = pastAppointments.length;
    let noShowCount = 0;
    let cancelledCount = 0;
    let completedCount = 0;

    for (const app of pastAppointments) {
      if (app.status === AppointmentStatus.NO_SHOW) {
        noShowCount++;
      } else if (app.status === AppointmentStatus.CANCELLED) {
        cancelledCount++;
      } else if (app.status === AppointmentStatus.COMPLETED) {
        completedCount++;
      }
    }

    const absenceRate =
      totalPast > 0 ? Math.round(((noShowCount + cancelledCount * 0.5) / totalPast) * 100) : 0;

    // Cálculo Heurístico Base
    let score = 15; // Baseline para qualquer agendamento

    if (totalPast === 0) {
      // Cliente novo: risco moderado padrão (30%)
      score = 30;
    } else {
      // Peso do histórico de faltas anteriores
      const rawAbsenceRate = (noShowCount / totalPast) * 100;
      if (rawAbsenceRate > 50) {
        score += 55;
      } else if (rawAbsenceRate > 25) {
        score += 35;
      } else if (rawAbsenceRate > 10) {
        score += 15;
      } else if (completedCount >= 3 && noShowCount === 0) {
        // Tutor assíduo com histórico positivo
        score -= 10;
      }

      // Penalidade por cancelamentos em cima da hora
      if (cancelledCount > 2) {
        score += 10;
      }
    }

    // Fator de Antecedência: agendamentos marcados com mais de 10 dias de antecedência
    const diffTimeMs = Math.abs(scheduledDate.getTime() - bookedAt.getTime());
    const diffDays = Math.ceil(diffTimeMs / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      score += 15; // Risco de esquecimento alto
    } else if (diffDays > 7) {
      score += 8;
    } else if (diffDays <= 1) {
      // Agendamento para o mesmo dia ou dia seguinte costuma ter comparecimento maior
      score -= 5;
    }

    // Fator Dia da Semana (Segundas e Sextas têm estatisticamente maior absenteísmo)
    const dayOfWeek = scheduledDate.getDay(); // 0 = Domingo, 1 = Segunda, 5 = Sexta
    if (dayOfWeek === 1 || dayOfWeek === 5) {
      score += 5;
    }

    // Normaliza score entre 0 e 100
    score = Math.max(5, Math.min(95, score));

    let level: NoShowRiskLevel = 'LOW';
    let explanation =
      'Tutor com histórico assíduo e alta taxa de comparecimento prévio.';
    let recommendation =
      'Envio de lembretes automáticos padrões via WhatsApp na véspera.';

    if (score >= 70) {
      level = 'HIGH';
      explanation = `Alto risco de falta detectado (${score}%). O tutor possui ${noShowCount} falta(s) prévia(s) em ${totalPast} consulta(s).`;
      recommendation =
        'Recomenda-se confirmação ativa por telefone ou mensagem prioritária pela recepção 24h antes.';
    } else if (score >= 30) {
      level = 'MEDIUM';
      explanation =
        totalPast === 0
          ? 'Primeira consulta do cliente na clínica. Sem histórico comportamental consolidado.'
          : `Risco moderado de falta (${score}%). Histórico com faltas ou agendamento de longa antecedência.`;
      recommendation =
        'Garantir que os lembretes de 24h e 2h estejam ativados no módulo de notificações.';
    }


    return {
      score,
      level,
      explanation,
      recommendation,
      stats: {
        totalPastAppointments: totalPast,
        noShowCount,
        cancelledCount,
        completedCount,
        absenceRatePercentage: absenceRate,
      },
    };
  }
}
