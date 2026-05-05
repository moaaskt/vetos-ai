import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.clinic.create({ data });
  }

  findAll() {
    return this.prisma.clinic.findMany();
  }

  findOne(id: string) {
    return this.prisma.clinic.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.clinic.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.clinic.delete({ where: { id } });
  }
}
