import { Module } from '@nestjs/common';
import { TutorAuthService } from './auth/tutor-auth.service';
import { TutorAuthController } from './auth/tutor-auth.controller';

@Module({
  providers: [TutorAuthService],
  controllers: [TutorAuthController]
})
export class TutorPlatformModule {}
