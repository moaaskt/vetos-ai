import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;

  const prisma = {
    plan: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    clinicSubscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    notificationLog: {
      count: jest.fn(),
    },
    clinicalAttachment: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClinicSubscription', () => {
    it('returns existing subscription if present', async () => {
      const mockSub = {
        id: 'sub-1',
        clinicId: 'clinic-1',
        planId: 'plan-1',
        plan: { id: 'plan-1', name: 'Professional', maxStaffSeats: 10 },
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(mockSub);

      const result = await service.getClinicSubscription('clinic-1');

      expect(result).toEqual(mockSub);
      expect(prisma.clinicSubscription.findUnique).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-1' },
        include: { plan: true },
      });
    });

    it('creates Starter plan fallback and subscription when none exists', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      const starterPlan = {
        id: 'plan-starter',
        name: 'Starter',
        maxStaffSeats: 3,
        maxNotifications: 150,
        maxStorage: 1024,
        features: JSON.stringify(['email_notifications', 'calendar']),
      };
      prisma.plan.findUnique.mockResolvedValue(starterPlan);

      const createdSub = {
        id: 'new-sub-1',
        clinicId: 'clinic-1',
        planId: 'plan-starter',
        plan: starterPlan,
      };
      prisma.clinicSubscription.create.mockResolvedValue(createdSub);

      const result = await service.getClinicSubscription('clinic-1');

      expect(result).toEqual(createdSub);
      expect(prisma.clinicSubscription.create).toHaveBeenCalledWith({
        data: {
          clinicId: 'clinic-1',
          planId: 'plan-starter',
        },
        include: { plan: true },
      });
    });
  });

  describe('getClinicUsage', () => {
    it('aggregates usage metrics and calculates percentages accurately', async () => {
      const mockSub = {
        id: 'sub-1',
        clinicId: 'clinic-1',
        customMaxStaffSeats: null,
        customMaxNotifications: null,
        customMaxStorage: null,
        plan: {
          id: 'plan-pro',
          name: 'Professional',
          maxStaffSeats: 10,
          maxNotifications: 1000,
          maxStorage: 10240, // 10GB
          features: JSON.stringify(['email_notifications', 'whatsapp_notifications']),
        },
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(mockSub);
      prisma.user.count.mockResolvedValue(5); // 50%
      prisma.notificationLog.count.mockResolvedValue(250); // 25%
      prisma.clinicalAttachment.aggregate.mockResolvedValue({
        _sum: { fileSize: BigInt(524288000) }, // 500MB
      });

      const usage = await service.getClinicUsage('clinic-1');

      expect(usage.plan.name).toBe('Professional');
      expect(usage.plan.features).toEqual(['email_notifications', 'whatsapp_notifications']);

      // Staff
      expect(usage.metrics.staff.used).toBe(5);
      expect(usage.metrics.staff.limit).toBe(10);
      expect(usage.metrics.staff.percentage).toBe(50);
      expect(usage.metrics.staff.isExceeded).toBe(false);

      // Notifications
      expect(usage.metrics.notifications.used).toBe(250);
      expect(usage.metrics.notifications.limit).toBe(1000);
      expect(usage.metrics.notifications.percentage).toBe(25);
      expect(usage.metrics.notifications.isExceeded).toBe(false);

      // Storage
      expect(usage.metrics.storage.usedMB).toBe(500);
      expect(usage.metrics.storage.limitMB).toBe(10240);
      expect(usage.metrics.storage.percentage).toBe(5);
      expect(usage.metrics.storage.isExceeded).toBe(false);
    });
  });

  describe('changePlan', () => {
    it('throws NotFoundException if target plan does not exist', async () => {
      prisma.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.changePlan('clinic-1', 'non-existent-plan'),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates clinic subscription to new plan successfully', async () => {
      const targetPlan = { id: 'plan-ent', name: 'Enterprise' };
      prisma.plan.findUnique.mockResolvedValue(targetPlan);

      const existingSub = {
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { id: 'plan-starter', name: 'Starter' },
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(existingSub);
      prisma.clinicSubscription.update.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        planId: 'plan-ent',
        plan: targetPlan,
      });

      const result = await service.changePlan('clinic-1', 'plan-ent');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Enterprise');
      expect(prisma.clinicSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            planId: 'plan-ent',
          }),
        }),
      );
    });
  });

  describe('assertCanAddStaff', () => {
    it('allows adding staff when count is below limit', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxStaffSeats: 5 },
      });
      prisma.user.count.mockResolvedValue(3);

      await expect(service.assertCanAddStaff('clinic-1')).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when user count reaches or exceeds limit', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxStaffSeats: 3 },
      });
      prisma.user.count.mockResolvedValue(3);

      await expect(service.assertCanAddStaff('clinic-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assertCanSendNotification', () => {
    it('allows sending notifications when monthly count is below quota', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxNotifications: 100 },
      });
      prisma.notificationLog.count.mockResolvedValue(50);

      await expect(
        service.assertCanSendNotification('clinic-1'),
      ).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when monthly notification quota is reached', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxNotifications: 100 },
      });
      prisma.notificationLog.count.mockResolvedValue(100);

      await expect(
        service.assertCanSendNotification('clinic-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assertCanUploadStorage', () => {
    it('allows upload when new total is within limit', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxStorage: 100 }, // 100MB
      });
      prisma.clinicalAttachment.aggregate.mockResolvedValue({
        _sum: { fileSize: BigInt(50 * 1024 * 1024) }, // 50MB used
      });

      // Uploading 10MB
      await expect(
        service.assertCanUploadStorage('clinic-1', 10 * 1024 * 1024),
      ).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when file upload exceeds maxStorage limit', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        clinicId: 'clinic-1',
        plan: { maxStorage: 100 }, // 100MB
      });
      prisma.clinicalAttachment.aggregate.mockResolvedValue({
        _sum: { fileSize: BigInt(95 * 1024 * 1024) }, // 95MB used
      });

      // Uploading 10MB -> 105MB > 100MB
      await expect(
        service.assertCanUploadStorage('clinic-1', 10 * 1024 * 1024),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
