import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ImpersonateDto } from './dto/impersonate.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      clinicId: user.clinicId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // SECURITY NOTE: Interactive Transactions ($transaction) bypass standard model-level query
    // interception in some Prisma Extension setups if the transaction context is not correctly propagated
    // or if the operations are executed via the transaction client (prisma parameter) rather than the main
    // client. Every new transaction in the codebase must undergo rigorous architectural review to ensure
    // it does not introduce multi-tenant isolation leaks.
    const result = await this.prisma.$transaction(async (prisma) => {
      const clinic = await prisma.clinic.create({
        data: {
          name: registerDto.clinicName,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          role: Role.ADMIN,
          clinicId: clinic.id,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, clinic };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      clinicId: result.user.clinicId,
      role: result.user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: result.user,
      clinic: result.clinic,
    };
  }

  async impersonateClinic(superAdminId: string, dto: ImpersonateDto) {
    const superAdmin = await this.prisma.user.findUnique({
      where: { id: superAdminId },
    });
    if (!superAdmin || superAdmin.role !== Role.SUPERADMIN) {
      throw new UnauthorizedException(
        'Only Super Admins can impersonate clinics',
      );
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: dto.targetClinicId },
    });
    if (!clinic) {
      throw new BadRequestException('Target clinic not found');
    }

    await this.prisma.impersonationLog.create({
      data: {
        superAdminId,
        targetClinicId: dto.targetClinicId,
        reason: dto.reason,
      },
    });

    const payload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      role: superAdmin.role,
      clinicId: dto.targetClinicId,
      isImpersonating: true,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
