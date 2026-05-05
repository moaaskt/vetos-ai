import { PrismaService } from '../prisma/prisma.service';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(clinicId: string, data: any): import("@prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(clinicId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    }[]>;
    findOne(clinicId: string, id: string): import("@prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(clinicId: string, id: string, data: any): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    remove(clinicId: string, id: string): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
