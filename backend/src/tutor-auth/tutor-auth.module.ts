import { Module } from '@nestjs/common';
import { TutorAuthController } from './tutor-auth.controller';
import { TutorAuthService } from './tutor-auth.service';

@Module({
  controllers: [TutorAuthController],
  providers: [TutorAuthService]
})
export class TutorAuthModule {}
