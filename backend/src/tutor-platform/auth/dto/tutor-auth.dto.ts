export class RequestMagicLinkDto {
  email!: string;
}

export class VerifyMagicLinkDto {
  token!: string;
}

export class RefreshTutorSessionDto {
  refreshToken!: string;
}
