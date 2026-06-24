import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private validateCpf(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

    return true;
  }

  private cleanAndNormalizeData(data: any) {
    const normalized = { ...data };

    // Se CPF vier vazio, com espaços ou nulo/undefined, salvar explicitamente como null
    if (normalized.cpf === undefined || normalized.cpf === null || String(normalized.cpf).trim() === '') {
      normalized.cpf = null;
    } else {
      // Remover máscara e validar
      const cleanCpf = String(normalized.cpf).replace(/\D/g, '');
      if (cleanCpf === '') {
        normalized.cpf = null;
      } else {
        if (!this.validateCpf(cleanCpf)) {
          throw new BadRequestException('CPF inválido.');
        }
        normalized.cpf = cleanCpf;
      }
    }

    if (normalized.postalCode) {
      normalized.postalCode = String(normalized.postalCode).replace(/\D/g, '');
    }
    if (normalized.phone) {
      normalized.phone = String(normalized.phone).replace(/\D/g, '');
    }
    if (normalized.whatsapp) {
      normalized.whatsapp = String(normalized.whatsapp).replace(/\D/g, '');
    }
    if (normalized.emergencyPhone) {
      normalized.emergencyPhone = String(normalized.emergencyPhone).replace(/\D/g, '');
    }
    if (normalized.birthDate) {
      normalized.birthDate = new Date(normalized.birthDate);
    }

    return normalized;
  }

  async checkDuplicateCpf(clinicId: string, cpf: string | null, excludeId?: string) {
    if (!cpf) return;
    const existing = await this.prisma.client.findFirst({
      where: {
        clinicId,
        cpf,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um cliente cadastrado com este CPF nesta clínica.');
    }
  }

  async create(clinicId: string, data: any) {
    const normalizedData = this.cleanAndNormalizeData(data);
    await this.checkDuplicateCpf(clinicId, normalizedData.cpf);

    return this.prisma.client.create({
      data: { ...normalizedData, clinicId },
    });
  }

  findAll(clinicId: string) {
    return this.prisma.client.findMany({ where: { clinicId } });
  }

  findOne(clinicId: string, id: string) {
    return this.prisma.client.findFirst({ where: { id, clinicId } });
  }

  async update(clinicId: string, id: string, data: any) {
    const normalizedData = this.cleanAndNormalizeData(data);
    await this.checkDuplicateCpf(clinicId, normalizedData.cpf, id);

    // Como updateMany retorna { count: number }, para persistir os campos corretamente, fazemos o update individual mapeado
    // Garantindo a integridade dos dados
    await this.prisma.client.update({
      where: { id },
      data: normalizedData,
    });
    
    return { count: 1 };
  }

  remove(clinicId: string, id: string) {
    return this.prisma.client.deleteMany({
      where: { id, clinicId },
    });
  }
}
