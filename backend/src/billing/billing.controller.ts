import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ChangePlanDto } from './dto/change-plan.dto';
import { Throttle } from '@nestjs/throttler';

import { BillingWebhookGuard } from './billing-webhook.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSubscription(@CurrentUser() user: any) {
    return this.billingService.getClinicUsage(user.clinicId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  getPlans() {
    return this.billingService.getAvailablePlans();
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('change-plan')
  changePlan(@CurrentUser() user: any, @Body() body: ChangePlanDto) {
    return this.billingService.changePlan(user.clinicId, body.planId, user.role);
  }

  @UseGuards(BillingWebhookGuard)
  @Post('webhook')
  handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    return this.billingService.handleWebhook(payload, signature);
  }
}
