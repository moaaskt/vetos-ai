import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.clinicId);
  }

  @Get('super-admin/metrics')
  getSuperAdminMetrics(@CurrentUser() user: any) {
    if (user.role !== 'SUPERADMIN') {
      throw new Error('Unauthorized');
    }
    return this.dashboardService.getSuperAdminMetrics();
  }
}
