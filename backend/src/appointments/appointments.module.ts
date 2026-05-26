import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentAutomationService } from './appointment-automation.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentAutomationService],
})
export class AppointmentsModule {}
