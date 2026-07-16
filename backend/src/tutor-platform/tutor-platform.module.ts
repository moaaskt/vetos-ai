import { Module } from '@nestjs/common';
import { TutorAuthService } from './auth/tutor-auth.service';
import { TutorAuthController } from './auth/tutor-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { TutorPortalAuthGuard } from './auth/guards/tutor-portal-auth.guard';
import { TutorProfileController } from './profile/tutor-profile.controller';
import { TutorProfileService } from './profile/tutor-profile.service';
import { TutorPetsController } from './pets/tutor-pets.controller';
import { TutorPetsService } from './pets/tutor-pets.service';
import { TimelineService } from './timeline/timeline.service';
import { AppointmentsProvider } from './timeline/providers/appointments.provider';
import { VaccinesProvider } from './timeline/providers/vaccines.provider';
import { WeightsProvider } from './timeline/providers/weights.provider';
import { PrescriptionsProvider } from './timeline/providers/prescriptions.provider';
import { ConsentProvider } from './timeline/providers/consent.provider';
import { AttachmentsProvider } from './timeline/providers/attachments.provider';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    JwtModule.register({}),
  ],
  providers: [
    TutorAuthService, 
    TutorPortalAuthGuard,
    TutorProfileService,
    TutorPetsService,
    TimelineService,
    AppointmentsProvider,
    VaccinesProvider,
    WeightsProvider,
    PrescriptionsProvider,
    ConsentProvider,
    AttachmentsProvider,
  ],
  controllers: [TutorAuthController, TutorProfileController, TutorPetsController],
  exports: [TutorAuthService, TutorPortalAuthGuard, JwtModule],
})
export class TutorPlatformModule {}
