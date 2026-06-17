import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConsentTermsService } from './consent-terms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { CreateConsentTermDto } from './dto/create-consent-term.dto';

@UseGuards(JwtAuthGuard)
@Controller('consent-terms')
export class ConsentTermsController {
  constructor(private readonly consentTermsService: ConsentTermsService) {}

  @Get('templates')
  findAllTemplates(@CurrentUser() user: any) {
    return this.consentTermsService.findAllTemplates(user.clinicId);
  }

  @Post('templates')
  createTemplate(
    @CurrentUser() user: any,
    @Body() createConsentTemplateDto: CreateConsentTemplateDto,
  ) {
    return this.consentTermsService.createTemplate(user.clinicId, createConsentTemplateDto);
  }

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createConsentTermDto: CreateConsentTermDto,
  ) {
    return this.consentTermsService.create(user.clinicId, createConsentTermDto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consentTermsService.findOne(user.clinicId, id);
  }

  @Post(':id/sign')
  sign(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consentTermsService.sign(user.clinicId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consentTermsService.remove(user.clinicId, id);
  }
}
