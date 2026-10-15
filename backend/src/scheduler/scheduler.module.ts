import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AiModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
