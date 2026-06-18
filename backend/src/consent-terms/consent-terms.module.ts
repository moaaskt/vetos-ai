import { Module } from '@nestjs/common';
import { ConsentTermsService } from './consent-terms.service';
import { ConsentTermsController } from './consent-terms.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ConsentTermsController],
  providers: [ConsentTermsService],
  exports: [ConsentTermsService],
})
export class ConsentTermsModule {}
