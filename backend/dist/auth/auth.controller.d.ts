import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
        };
        clinic: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            phone: string | null;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
}
