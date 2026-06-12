import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { CreateVaccineProtocolDto, CreateVaccineProtocolDoseDto } from './dto/create-vaccine-protocol.dto';
import { ApplyVaccineProtocolDto } from './dto/apply-vaccine-protocol.dto';
import { ApplyScheduledDoseDto } from './dto/apply-scheduled-dose.dto';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

@Injectable()
export class VaccinesService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, data: CreateVaccineDto) {
    // Valida se o pet pertence à clínica logada
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: data.petId,
        clinicId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    return this.prisma.vaccineRecord.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
        petId: data.petId,
        clinicId,
      },
    });
  }

  async remove(clinicId: string, id: string) {
    const result = await this.prisma.vaccineRecord.deleteMany({
      where: {
        id,
        clinicId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Registro de vacina não encontrado ou não pertencente a esta clínica.',
      );
    }

    return { success: true };
  }

  async generateCertificateStream(
    clinicId: string,
    petId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; petName: string }> {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        clinicId,
      },
      include: {
        client: true,
        vaccineRecords: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: {
        id: clinicId,
      },
    });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Cabeçalho da Clínica
    if (clinic) {
      doc.fontSize(16).text(clinic.name.toUpperCase(), { align: 'center' });
      const addressText = [
        clinic.address || '',
        clinic.phone ? `Tel: ${clinic.phone}` : '',
      ]
        .filter(Boolean)
        .join(' - ');
      if (addressText) {
        doc.fontSize(9).text(addressText, { align: 'center' });
      }
      doc.moveDown(1.5);
    }

    // Título Principal
    doc.fontSize(22).text('CERTIFICADO DE VACINAÇÃO', {
      align: 'center',
      underline: true,
    });
    doc.moveDown(2);

    // Dados do Pet e do Proprietário
    doc.fontSize(12).text('DADOS DO PACIENTE E PROPRIETÁRIO', { underline: true });
    doc.moveDown(0.5);

    const clientName = pet.client?.name || 'Não informado';
    const clientPhone = pet.client?.phone || 'Não informado';

    doc.fontSize(10).text(`Proprietário: ${clientName}`);
    doc.text(`Telefone: ${clientPhone}`);
    doc.text(`Paciente (Pet): ${pet.name}`);
    doc.text(`Espécie: ${pet.species}`);
    if (pet.breed) {
      doc.text(`Raça: ${pet.breed}`);
    }
    if (pet.age) {
      doc.text(`Idade: ${pet.age} ano(s)`);
    }
    doc.moveDown(2);

    // Tabela de Vacinas
    doc.fontSize(12).text('HISTÓRICO VACINAL', { underline: true });
    doc.moveDown(1);

    const vaccineRecords = pet.vaccineRecords || [];

    if (vaccineRecords.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text('Nenhum registro de vacinação encontrado para este paciente.');
      doc.font('Helvetica');
    } else {
      // Cabeçalho da tabela
      const startX = 50;
      let currentY = doc.y;

      doc.fontSize(10);
      doc.text('Vacina', startX, currentY);
      doc.text('Data de Aplicação', startX + 200, currentY);
      doc.text('Próxima Dose', startX + 350, currentY);

      // Linha horizontal abaixo do cabeçalho da tabela
      doc
        .moveTo(startX, currentY + 15)
        .lineTo(550, currentY + 15)
        .stroke();
      doc.moveDown(1.5);

      vaccineRecords.forEach((vac) => {
        currentY = doc.y;
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const dateStr = new Date(vac.date).toLocaleDateString('pt-BR');
        const nextDoseStr = vac.nextDoseDate
          ? new Date(vac.nextDoseDate).toLocaleDateString('pt-BR')
          : '---';

        doc.text(vac.name, startX, currentY);
        doc.text(dateStr, startX + 200, currentY);
        doc.text(nextDoseStr, startX + 350, currentY);
        doc.moveDown(1.2);
      });
    }

    doc.moveDown(3);

    // Espaço para Assinatura do Responsável Técnico
    const endY = doc.y;
    if (endY > 700) {
      doc.addPage();
    }
    doc
      .moveTo(150, doc.y + 40)
      .lineTo(450, doc.y + 40)
      .stroke();
    doc
      .fontSize(9)
      .text(
        'Assinatura do Médico Veterinário / Responsável Técnico',
        50,
        doc.y + 45,
        { align: 'center' },
      );

    // Rodapé de geração
    const timestampStr = new Date().toLocaleString('pt-BR');
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .text(`Documento gerado em: ${timestampStr}`, 50, 750, {
        align: 'right',
      });
    doc.font('Helvetica');

    doc.end();

    return { stream, petName: pet.name };
  }

  // --- MÉTODOS DE PROTOCOLOS VACINAIS (Fase 14B.2) ---

  async createProtocol(clinicId: string, data: CreateVaccineProtocolDto) {
    return this.prisma.vaccineProtocol.create({
      data: {
        name: data.name,
        species: data.species,
        clinicId,
        doses: {
          create: data.doses.map((dose: CreateVaccineProtocolDoseDto) => ({
            vaccineName: dose.vaccineName,
            doseOrder: dose.doseOrder,
            intervalDays: dose.intervalDays,
          })),
        },
      },
      include: {
        doses: {
          orderBy: {
            doseOrder: 'asc',
          },
        },
      },
    });
  }

  async findAllProtocols(clinicId: string) {
    return this.prisma.vaccineProtocol.findMany({
      where: {
        clinicId,
      },
      include: {
        doses: {
          orderBy: {
            doseOrder: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOneProtocol(clinicId: string, id: string) {
    const protocol = await this.prisma.vaccineProtocol.findFirst({
      where: {
        id,
        clinicId,
      },
      include: {
        doses: {
          orderBy: {
            doseOrder: 'asc',
          },
        },
      },
    });

    if (!protocol) {
      throw new NotFoundException('Protocolo vacinal não encontrado.');
    }

    return protocol;
  }

  async updateProtocol(clinicId: string, id: string, data: CreateVaccineProtocolDto) {
    // Valida existência
    await this.findOneProtocol(clinicId, id);

    // Deleta as doses antigas para recriá-las (abordagem segura e limpa para evitar conflitos)
    await this.prisma.vaccineProtocolDose.deleteMany({
      where: {
        protocolId: id,
      },
    });

    return this.prisma.vaccineProtocol.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        species: data.species,
        doses: {
          create: data.doses.map((dose: CreateVaccineProtocolDoseDto) => ({
            vaccineName: dose.vaccineName,
            doseOrder: dose.doseOrder,
            intervalDays: dose.intervalDays,
          })),
        },
      },
      include: {
        doses: {
          orderBy: {
            doseOrder: 'asc',
          },
        },
      },
    });
  }

  async removeProtocol(clinicId: string, id: string) {
    const protocol = await this.findOneProtocol(clinicId, id);

    await this.prisma.vaccineProtocol.delete({
      where: {
        id: protocol.id,
      },
    });

    return { success: true };
  }

  async applyProtocol(clinicId: string, data: ApplyVaccineProtocolDto) {
    // Valida pet
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: data.petId,
        clinicId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Paciente não encontrado nesta clínica.');
    }

    // Valida protocolo
    const protocol = await this.prisma.vaccineProtocol.findFirst({
      where: {
        id: data.protocolId,
        clinicId,
      },
      include: {
        doses: {
          orderBy: {
            doseOrder: 'asc',
          },
        },
      },
    });

    if (!protocol) {
      throw new NotFoundException('Protocolo vacinal não encontrado.');
    }

    if (protocol.doses.length === 0) {
      throw new NotFoundException('Este protocolo não possui doses configuradas.');
    }

    const createdRecords = [];
    let currentBaseDate = new Date(data.startDate);

    for (const dose of protocol.doses) {
      // Calcula a data esperada para esta dose.
      // Se for a primeira dose, ela é aplicada a partir da startDate
      // Doses seguintes são calculadas somando o intervalo à data da dose anterior.
      if (dose.doseOrder > 1) {
        const nextDate = new Date(currentBaseDate.getTime());
        nextDate.setDate(nextDate.getDate() + dose.intervalDays);
        currentBaseDate = nextDate;
      } else {
        // Primeira dose: se tiver intervalDays, soma à startDate, senão usa a startDate direta
        if (dose.intervalDays > 0) {
          const nextDate = new Date(currentBaseDate.getTime());
          nextDate.setDate(nextDate.getDate() + dose.intervalDays);
          currentBaseDate = nextDate;
        }
      }

      const record = await this.prisma.vaccineRecord.create({
        data: {
          name: dose.vaccineName,
          date: currentBaseDate,
          status: 'SCHEDULED',
          protocolId: protocol.id,
          protocolDoseId: dose.id,
          petId: pet.id,
          clinicId,
        },
      });

      createdRecords.push(record);
    }

    return createdRecords;
  }

  async applyScheduledDose(clinicId: string, vaccineRecordId: string, data: ApplyScheduledDoseDto) {
    const record = await this.prisma.vaccineRecord.findFirst({
      where: {
        id: vaccineRecordId,
        clinicId,
      },
    });

    if (!record) {
      throw new NotFoundException('Registro de vacina não encontrado.');
    }

    // Validação de sequência do protocolo vacinal (Phase 14B.2E)
    if (record.protocolId && record.protocolDoseId) {
      const currentDose = await this.prisma.vaccineProtocolDose.findUnique({
        where: {
          id: record.protocolDoseId,
        },
      });

      if (currentDose) {
        const siblingRecords = await this.prisma.vaccineRecord.findMany({
          where: {
            petId: record.petId,
            protocolId: record.protocolId,
          },
          include: {
            protocolDose: true,
          },
        });

        const hasPendingPreviousDose = siblingRecords.some(
          (r) =>
            r.status === 'SCHEDULED' &&
            r.protocolDose &&
            r.protocolDose.doseOrder < currentDose.doseOrder,
        );

        if (hasPendingPreviousDose) {
          throw new BadRequestException(
            'Esta dose não pode ser aplicada ainda. Existem etapas anteriores pendentes.',
          );
        }
      }
    }

    const appliedDate = new Date(data.date);

    // Atualiza a dose atual para APPLIED
    const updatedRecord = await this.prisma.vaccineRecord.update({
      where: {
        id: vaccineRecordId,
      },
      data: {
        status: 'APPLIED',
        date: appliedDate,
        lotNumber: data.lotNumber || null,
        manufacturer: data.manufacturer || null,
        appliedById: data.appliedById || null,
        notes: data.notes || null,
      },
    });

    // Se solicitado o recálculo subsequente e a dose faz parte de um protocolo
    if (data.recalculateSubsequent && record.protocolId && record.protocolDoseId) {
      const currentDose = await this.prisma.vaccineProtocolDose.findUnique({
        where: {
          id: record.protocolDoseId,
        },
      });

      if (currentDose) {
        // Busca todas as vacinas futuras associadas a esse protocolo no pet
        const subsequentRecords = await this.prisma.vaccineRecord.findMany({
          where: {
            petId: record.petId,
            protocolId: record.protocolId,
            status: 'SCHEDULED',
          },
          include: {
            protocolDose: true,
          },
        });

        // Ordena as vacinas baseando-se no doseOrder da dose do protocolo
        const sortedSubsequent = subsequentRecords
          .filter((rec) => rec.protocolDose && rec.protocolDose.doseOrder > currentDose.doseOrder)
          .sort((a, b) => (a.protocolDose?.doseOrder || 0) - (b.protocolDose?.doseOrder || 0));

        let lastDate = appliedDate;

        for (const subRecord of sortedSubsequent) {
          const interval = subRecord.protocolDose?.intervalDays || 0;
          const nextDate = new Date(lastDate.getTime());
          nextDate.setDate(nextDate.getDate() + interval);
          
          await this.prisma.vaccineRecord.update({
            where: {
              id: subRecord.id,
            },
            data: {
              date: nextDate,
            },
          });

          lastDate = nextDate;
        }
      }
    }

    return updatedRecord;
  }
}

