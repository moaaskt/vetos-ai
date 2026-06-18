import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { ConsentTermsModule } from '../consent-terms/consent-terms.module';

@Module({
  imports: [ConsentTermsModule],
  controllers: [VerificationController],
})
export class VerificationModule {}
