import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicsModule } from './clinics/clinics.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [PrismaModule, ClinicsModule, UsersModule, AuthModule, ClientsModule, PetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
