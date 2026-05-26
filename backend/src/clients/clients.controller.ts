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
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createClientDto: any) {
    return this.clientsService.create(user.clinicId, createClientDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.clientsService.findAll(user.clinicId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.findOne(user.clinicId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateClientDto: any,
  ) {
    return this.clientsService.update(user.clinicId, id, updateClientDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.remove(user.clinicId, id);
  }
}
