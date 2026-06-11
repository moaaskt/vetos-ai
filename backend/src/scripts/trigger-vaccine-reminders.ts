/**
 * DEVELOPMENT/TESTING ONLY
 *
 * This script manually triggers the vaccine reminder scheduling logic.
 * It is restricted to development or testing environments and must not
 * be executed in production.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SchedulerService } from '../scheduler/scheduler.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('DevTriggerVaccineReminders');
  logger.log('Starting standalone application context for vaccine reminders trigger...');

  // Strict check to prevent running in production
  if (process.env.NODE_ENV === 'production') {
    logger.error('CRITICAL ERROR: This script is restricted to DEVELOPMENT or TESTING environments only!');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const schedulerService = app.get(SchedulerService);
    logger.log('Calling schedulerService.enqueueVaccineReminders()...');
    await schedulerService.enqueueVaccineReminders();
    logger.log('enqueueVaccineReminders executed successfully!');
    
    logger.log('Waiting 5 seconds for BullMQ workers to process the queue...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    logger.log('Finished waiting.');
  } catch (error) {
    logger.error('Failed to trigger scheduler service:', error);
  } finally {
    await app.close();
    logger.log('Application context closed.');
  }
}

bootstrap();
