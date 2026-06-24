"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateCpf(cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf))
            return false;
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++)
            sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11)
            remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(9, 10)))
            return false;
        sum = 0;
        for (let i = 1; i <= 10; i++)
            sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11)
            remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(10, 11)))
            return false;
        return true;
    }
    cleanAndNormalizeData(data) {
        const normalized = { ...data };
        if (normalized.cpf === undefined || normalized.cpf === null || String(normalized.cpf).trim() === '') {
            normalized.cpf = null;
        }
        else {
            const cleanCpf = String(normalized.cpf).replace(/\D/g, '');
            if (cleanCpf === '') {
                normalized.cpf = null;
            }
            else {
                if (!this.validateCpf(cleanCpf)) {
                    throw new common_1.BadRequestException('CPF inválido.');
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
    async checkDuplicateCpf(clinicId, cpf, excludeId) {
        if (!cpf)
            return;
        const existing = await this.prisma.client.findFirst({
            where: {
                clinicId,
                cpf,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe um cliente cadastrado com este CPF nesta clínica.');
        }
    }
    async create(clinicId, data) {
        const normalizedData = this.cleanAndNormalizeData(data);
        await this.checkDuplicateCpf(clinicId, normalizedData.cpf);
        return this.prisma.client.create({
            data: { ...normalizedData, clinicId },
        });
    }
    findAll(clinicId) {
        return this.prisma.client.findMany({ where: { clinicId } });
    }
    findOne(clinicId, id) {
        return this.prisma.client.findFirst({ where: { id, clinicId } });
    }
    async update(clinicId, id, data) {
        const normalizedData = this.cleanAndNormalizeData(data);
        await this.checkDuplicateCpf(clinicId, normalizedData.cpf, id);
        await this.prisma.client.update({
            where: { id },
            data: normalizedData,
        });
        return { count: 1 };
    }
    remove(clinicId, id) {
        return this.prisma.client.deleteMany({
            where: { id, clinicId },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map