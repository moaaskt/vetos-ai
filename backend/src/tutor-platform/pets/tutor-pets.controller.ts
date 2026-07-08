import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TutorPortalAuthGuard } from '../auth/guards/tutor-portal-auth.guard';
import { CurrentTutor } from '../auth/decorators/current-tutor.decorator';
import { TutorPetsService } from './tutor-pets.service';
import { TimelineService } from '../timeline/timeline.service';

@Controller('tutor/pets')
@UseGuards(TutorPortalAuthGuard)
export class TutorPetsController {
  constructor(
    private readonly tutorPetsService: TutorPetsService,
    private readonly timelineService: TimelineService,
  ) {}

  @Get()
  async getPets(@CurrentTutor() tutorContext: any) {
    return this.tutorPetsService.getPets(tutorContext.allowedPetIds);
  }

  @Get(':id')
  async getPetDetails(@Param('id') id: string, @CurrentTutor() tutorContext: any) {
    return this.tutorPetsService.getPetDetails(id, tutorContext.allowedPetIds);
  }

  @Get(':id/timeline')
  async getPetTimeline(@Param('id') id: string, @CurrentTutor() tutorContext: any) {
    // Validates permission inside getPetDetails
    await this.tutorPetsService.getPetDetails(id, tutorContext.allowedPetIds);
    return this.timelineService.getTimeline(id);
  }
}
