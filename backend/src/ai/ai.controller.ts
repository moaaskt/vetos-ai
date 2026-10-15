import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClinicalCopilotService } from './clinical-copilot.service';
import { NoShowPredictorService } from './no-show-predictor.service';
import { ReengagementService } from './reengagement.service';
import { AnamnesisPromptDto } from './dto/anamnesis-prompt.dto';
import { Throttle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly clinicalCopilot: ClinicalCopilotService,
    private readonly noShowPredictor: NoShowPredictorService,
    private readonly reengagementService: ReengagementService,
  ) {}

  /**
   * Endpoint de apoio diagnóstico veterinário (Copilot de Anamnese).
   */
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('clinical-copilot/suggest')
  async suggestDiagnosis(
    @CurrentUser() user: any,
    @Body() dto: AnamnesisPromptDto,
  ) {
    return this.clinicalCopilot.generateDifferentialDiagnosis(
      user.clinicId,
      dto,
    );
  }

  /**
   * Avalia a probabilidade de No-Show para um agendamento.
   */
  @Get('no-show-risk/:appointmentId')
  async getNoShowRisk(
    @CurrentUser() user: any,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.noShowPredictor.predictForAppointment(
      appointmentId,
      user.clinicId,
    );
  }

  /**
   * Lista candidatos inativos elegíveis para reengajamento por IA.
   */
  @Get('reengagement/candidates')
  async getReengagementCandidates(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.reengagementService.findInactiveClients(
      user.clinicId,
      parsedLimit,
    );
  }

  /**
   * Dispara lote manual de reengajamento de clientes inativos (Restrito a ADMIN / SUPERADMIN).
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post('reengagement/trigger-batch')
  async triggerReengagementBatch(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.reengagementService.processClinicReengagementBatch(
      user.clinicId,
      parsedLimit,
    );
  }
}
