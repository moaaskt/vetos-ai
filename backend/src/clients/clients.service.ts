import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, data: any) {
    return this.prisma.client.create({
      data: { ...data, clinicId },
    });
  }

  findAll(clinicId: string) {
    return this.prisma.client.findMany({ where: { clinicId } });
  }

  findOne(clinicId: string, id: string) {
    return this.prisma.client.findFirst({ where: { id, clinicId } });
  }

  update(clinicId: string, id: string, data: any) {
    return this.prisma.client.updateMany({
      where: { id, clinicId },
      data,
    });
  }

  remove(clinicId: string, id: string) {
    return this.prisma.client.deleteMany({
      where: { id, clinicId },
    });
  }
}
