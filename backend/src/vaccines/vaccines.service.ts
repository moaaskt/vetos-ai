import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
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
}
