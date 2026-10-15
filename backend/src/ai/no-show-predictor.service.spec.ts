import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NoShowPredictorService } from './no-show-predictor.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

describe('NoShowPredictorService', () => {
  let service: NoShowPredictorService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoShowPredictorService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NoShowPredictorService>(NoShowPredictorService);
    prismaService = module.get(PrismaService);
  });

  it('deve lançar NotFoundException se a consulta não existir na clínica', async () => {
    (prismaService.appointment.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.predictForAppointment('non-existent', 'clinic-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve classificar como LOW risco um tutor assíduo sem faltas', async () => {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 2);

    (prismaService.appointment.findFirst as jest.Mock).mockResolvedValue({
      id: 'app-1',
      clientId: 'client-loyal',
      clinicId: 'clinic-1',
      date: appointmentDate,
      createdAt: new Date(),
      client: { id: 'client-loyal', name: 'Ana Souza' },
    });

    (prismaService.appointment.findMany as jest.Mock).mockResolvedValue([
      { id: 'p1', status: AppointmentStatus.COMPLETED, date: new Date() },
      { id: 'p2', status: AppointmentStatus.COMPLETED, date: new Date() },
      { id: 'p3', status: AppointmentStatus.COMPLETED, date: new Date() },
      { id: 'p4', status: AppointmentStatus.COMPLETED, date: new Date() },
    ]);

    const result = await service.predictForAppointment('app-1', 'clinic-1');

    expect(result.level).toBe('LOW');
    expect(result.score).toBeLessThan(35);
    expect(result.stats.noShowCount).toBe(0);
    expect(result.stats.completedCount).toBe(4);
  });

  it('deve classificar como HIGH risco um tutor com histórico recorrente de no-show', async () => {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 15); // Longa antecedência

    (prismaService.appointment.findFirst as jest.Mock).mockResolvedValue({
      id: 'app-2',
      clientId: 'client-absent',
      clinicId: 'clinic-1',
      date: appointmentDate,
      createdAt: new Date(),
      client: { id: 'client-absent', name: 'Marcos Lima' },
    });

    (prismaService.appointment.findMany as jest.Mock).mockResolvedValue([
      { id: 'p1', status: AppointmentStatus.NO_SHOW, date: new Date() },
      { id: 'p2', status: AppointmentStatus.NO_SHOW, date: new Date() },
      { id: 'p3', status: AppointmentStatus.CANCELLED, date: new Date() },
    ]);

    const result = await service.predictForAppointment('app-2', 'clinic-1');

    expect(result.level).toBe('HIGH');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.stats.noShowCount).toBe(2);
  });

  it('deve classificar como MEDIUM risco um novo cliente sem histórico prévio', async () => {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 10);

    (prismaService.appointment.findFirst as jest.Mock).mockResolvedValue({
      id: 'app-3',
      clientId: 'client-new',
      clinicId: 'clinic-1',
      date: appointmentDate,
      createdAt: new Date(),
      client: { id: 'client-new', name: 'Novo Cliente' },
    });

    (prismaService.appointment.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.predictForAppointment('app-3', 'clinic-1');

    expect(result.level).toBe('MEDIUM');
    expect(result.stats.totalPastAppointments).toBe(0);
  });
});
