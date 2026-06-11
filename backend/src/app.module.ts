import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicsModule } from './clinics/clinics.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { PetsModule } from './pets/pets.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AllergiesModule } from './allergies/allergies.module';
import { ClinicalRecordsModule } from './clinical-records/clinical-records.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { WeightRecordsModule } from './weight-records/weight-records.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    ScheduleModule.forRoot(),

    PrismaModule,
    ClinicsModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    PetsModule,
    AppointmentsModule,
    DashboardModule,
    NotificationsModule,
    SchedulerModule,
    AllergiesModule,
    ClinicalRecordsModule,
    VaccinesModule,
    WeightRecordsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
