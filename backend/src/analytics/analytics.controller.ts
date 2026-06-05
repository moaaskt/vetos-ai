import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: any) {
    return this.analyticsService.getOverview(user.clinicId);
  }

  @Get('trends')
  getTrends(@CurrentUser() user: any) {
    return this.analyticsService.getTrends(user.clinicId);
  }
}

