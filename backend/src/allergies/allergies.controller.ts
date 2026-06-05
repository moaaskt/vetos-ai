import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AllergiesService } from './allergies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateAllergyDto } from './dto/create-allergy.dto';

@UseGuards(JwtAuthGuard)
@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createAllergyDto: CreateAllergyDto) {
    return this.allergiesService.create(user.clinicId, createAllergyDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.allergiesService.remove(user.clinicId, id);
  }
}
