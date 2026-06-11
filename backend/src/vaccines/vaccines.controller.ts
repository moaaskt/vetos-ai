import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Get,
  Put,
  Res,
} from '@nestjs/common';
import { VaccinesService } from './vaccines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { CreateVaccineProtocolDto } from './dto/create-vaccine-protocol.dto';
import { ApplyVaccineProtocolDto } from './dto/apply-vaccine-protocol.dto';
import { ApplyScheduledDoseDto } from './dto/apply-scheduled-dose.dto';
import * as express from 'express';

@UseGuards(JwtAuthGuard)
@Controller('vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createVaccineDto: CreateVaccineDto) {
    return this.vaccinesService.create(user.clinicId, createVaccineDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vaccinesService.remove(user.clinicId, id);
  }

  @Get('pet/:petId/certificate')
  async generateCertificate(
    @CurrentUser() user: any,
    @Param('petId') petId: string,
    @Res() res: express.Response,
  ) {
    const { stream, petName } =
      await this.vaccinesService.generateCertificateStream(
        user.clinicId,
        petId,
      );

    const safePetName = petName.replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="certificado_vacinas_${safePetName}.pdf"`,
    );

    stream.pipe(res);
  }

  // --- ROTAS DE PROTOCOLOS VACINAIS (Fase 14B.2) ---

  @Post('protocols')
  createProtocol(
    @CurrentUser() user: any,
    @Body() createVaccineProtocolDto: CreateVaccineProtocolDto,
  ) {
    return this.vaccinesService.createProtocol(
      user.clinicId,
      createVaccineProtocolDto,
    );
  }

  @Get('protocols')
  findAllProtocols(@CurrentUser() user: any) {
    return this.vaccinesService.findAllProtocols(user.clinicId);
  }

  @Get('protocols/:id')
  findOneProtocol(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vaccinesService.findOneProtocol(user.clinicId, id);
  }

  @Put('protocols/:id')
  updateProtocol(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateVaccineProtocolDto: CreateVaccineProtocolDto,
  ) {
    return this.vaccinesService.updateProtocol(
      user.clinicId,
      id,
      updateVaccineProtocolDto,
    );
  }

  @Delete('protocols/:id')
  removeProtocol(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vaccinesService.removeProtocol(user.clinicId, id);
  }

  @Post('apply-protocol')
  applyProtocol(
    @CurrentUser() user: any,
    @Body() applyVaccineProtocolDto: ApplyVaccineProtocolDto,
  ) {
    return this.vaccinesService.applyProtocol(
      user.clinicId,
      applyVaccineProtocolDto,
    );
  }

  @Post(':id/apply')
  applyScheduledDose(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() applyScheduledDoseDto: ApplyScheduledDoseDto,
  ) {
    return this.vaccinesService.applyScheduledDose(
      user.clinicId,
      id,
      applyScheduledDoseDto,
    );
  }
}

