import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { VaccinesService } from './vaccines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
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
}
