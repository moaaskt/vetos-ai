import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VaccinesService } from './vaccines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateVaccineDto } from './dto/create-vaccine.dto';

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
}
