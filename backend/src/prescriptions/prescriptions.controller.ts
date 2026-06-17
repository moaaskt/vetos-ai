import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(user.clinicId, createPrescriptionDto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prescriptionsService.findOne(user.clinicId, id);
  }

  @Post(':id/sign')
  sign(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prescriptionsService.sign(user.clinicId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prescriptionsService.remove(user.clinicId, id);
  }
}
