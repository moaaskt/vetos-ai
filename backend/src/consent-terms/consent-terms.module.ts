import { Module } from '@nestjs/common';
import { ConsentTermsService } from './consent-terms.service';
import { ConsentTermsController } from './consent-terms.controller';

@Module({
  controllers: [ConsentTermsController],
  providers: [ConsentTermsService],
  exports: [ConsentTermsService],
})
export class ConsentTermsModule {}
