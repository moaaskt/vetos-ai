import { PrismaService } from '../prisma/prisma.service';
export declare class PetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(clinicId: string, data: any): import("@prisma/client").Prisma.Prisma__PetClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clinicId: string;
        species: string;
        breed: string | null;
        age: number | null;
        clientId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(clinicId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clinicId: string;
        species: string;
        breed: string | null;
        age: number | null;
        clientId: string;
    }[]>;
    findOne(clinicId: string, id: string): import("@prisma/client").Prisma.Prisma__PetClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clinicId: string;
        species: string;
        breed: string | null;
        age: number | null;
        clientId: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(clinicId: string, id: string, data: any): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    remove(clinicId: string, id: string): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
