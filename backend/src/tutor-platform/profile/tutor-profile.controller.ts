import { Controller, Get, UseGuards } from '@nestjs/common';
import { TutorPortalAuthGuard } from '../auth/guards/tutor-portal-auth.guard';
import { CurrentTutor } from '../auth/decorators/current-tutor.decorator';
import { TutorProfileService } from './tutor-profile.service';

@Controller('tutor/me')
@UseGuards(TutorPortalAuthGuard)
export class TutorProfileController {
  constructor(private readonly tutorProfileService: TutorProfileService) {}

  @Get()
  async getProfile(@CurrentTutor() tutorContext: any) {
    return this.tutorProfileService.getProfile(tutorContext.tutorIdentityId);
  }
}
