import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ChangePlanDto } from './dto/change-plan.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('change-plan')
  changePlan(@CurrentUser() user: any, @Body() body: ChangePlanDto) {
    return this.billingService.changePlan(user.clinicId, body.planId);
  }

  @Post('webhook')
  handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    return this.billingService.handleWebhook(payload, signature);
  }
}
