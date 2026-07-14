import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentTutorPayload {
  tutorIdentityId: string;
  publicId: string;
  allowedClientIds: string[];
  allowedClinicIds: string[];
  allowedPetIds: string[];
}

export const CurrentTutor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentTutorPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.tutor;
  },
);
