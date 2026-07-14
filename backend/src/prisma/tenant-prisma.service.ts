import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';
import { getTenantExtension } from './tenant-prisma.extension';

@Injectable()
export class TenantPrismaService implements OnModuleInit {
  public readonly client: ReturnType<typeof getTenantExtension> & PrismaClient;

  constructor(private readonly tenantContext: TenantContextService) {
    const baseClient = new PrismaClient();
    this.client = baseClient.$extends(getTenantExtension(this.tenantContext)) as any;
  }

  async onModuleInit() {
    // Garante inicialização do Prisma Client
  }
}
