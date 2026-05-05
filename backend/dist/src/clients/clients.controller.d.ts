import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(user: any, createClientDto: any): import("@prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(user: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    }[]>;
    findOne(user: any, id: string): import("@prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        clinicId: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(user: any, id: string, updateClientDto: any): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    remove(user: any, id: string): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
