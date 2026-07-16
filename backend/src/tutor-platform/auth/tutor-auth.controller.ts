import { Controller, Post, Body, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { TutorAuthService } from './tutor-auth.service';
import { RequestMagicLinkDto, VerifyMagicLinkDto, RefreshTutorSessionDto } from './dto/tutor-auth.dto';
import * as express from 'express';

@Controller('tutor/auth')
export class TutorAuthController {
  constructor(private readonly tutorAuthService: TutorAuthService) {}

  @Post('request-link')
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.tutorAuthService.requestMagicLink(dto.email);
  }

  @Post('verify')
  async verifyMagicLink(@Body() dto: VerifyMagicLinkDto, @Req() req: express.Request) {
    const ip = req.ip || (req.socket ? req.socket.remoteAddress : undefined);
    const userAgent = req.headers['user-agent'] as string;
    return this.tutorAuthService.verifyMagicLink(dto.token, ip, userAgent);
  }

  @Post('refresh')
  async refreshSession(@Body() dto: RefreshTutorSessionDto) {
    return this.tutorAuthService.refreshSession(dto.refreshToken);
  }
}
