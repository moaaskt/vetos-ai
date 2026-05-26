import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';

@UseGuards(JwtAuthGuard)
@Controller('clinical-records')
export class ClinicalRecordsController {
  constructor(
    private readonly clinicalRecordsService: ClinicalRecordsService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createClinicalRecordDto: CreateClinicalRecordDto,
  ) {
    return this.clinicalRecordsService.create(
      user.clinicId,
      createClinicalRecordDto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clinicalRecordsService.remove(user.clinicId, id);
  }
}
