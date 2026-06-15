import { Module } from '@nestjs/common';
import { ClinicalAttachmentsController } from './clinical-attachments.controller';
import { ClinicalAttachmentsService } from './clinical-attachments.service';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [StorageModule, PrismaModule],
  controllers: [ClinicalAttachmentsController],
  providers: [ClinicalAttachmentsService],
  exports: [ClinicalAttachmentsService],
})
export class ClinicalAttachmentsModule {}
