import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createPetDto: any) {
    return this.petsService.create(user.clinicId, createPetDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.petsService.findAll(user.clinicId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.petsService.findOne(user.clinicId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updatePetDto: any,
  ) {
    return this.petsService.update(user.clinicId, id, updatePetDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.petsService.remove(user.clinicId, id);
  }
}
