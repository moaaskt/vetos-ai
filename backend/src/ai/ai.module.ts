import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionService } from '../encryption/encryption.service';
import { GroqService } from './groq.service';
import { PromptSanitizerService } from './prompt-sanitizer.service';
import { ClinicalCopilotService } from './clinical-copilot.service';
import { NoShowPredictorService } from './no-show-predictor.service';
import { ReengagementService } from './reengagement.service';
import { AiController } from './ai.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => BillingModule),
  ],
  controllers: [AiController],
  providers: [
    EncryptionService,
    GroqService,
    PromptSanitizerService,
    ClinicalCopilotService,
    NoShowPredictorService,
    ReengagementService,
  ],
  exports: [
    GroqService,
    PromptSanitizerService,
    ClinicalCopilotService,
    NoShowPredictorService,
    ReengagementService,
  ],
})
export class AiModule {}
