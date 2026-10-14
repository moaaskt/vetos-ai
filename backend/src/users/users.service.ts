import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Mostly used when we already have a clinic
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const clinicId = (data as any).clinicId || data.clinic?.connect?.id;
    if (clinicId) {
      await this.billingService.assertCanAddStaff(clinicId);
    }
    return this.prisma.user.create({ data });
  }
}
