import { PrismaService } from '../prisma/prisma.service';
export declare class PetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(clinicId: string, data: any): import(".prisma/client").Prisma.Prisma__PetClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clinicId: string;
        species: string;
        breed: string | null;
        age: number | null;
        clientId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(clinicId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(clinicId: string, id: string): import(".prisma/client").Prisma.Prisma__PetClient<({
        client: {
            id: string;
            name: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            clinicId: string;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            reason: string | null;
            clientId: string;
            date: Date;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            petId: string;
            notifiedAt: Date | null;
        }[];
        weightRecords: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            date: Date;
            petId: string;
            weight: number;
        }[];
        allergies: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            petId: string;
        }[];
        vaccineRecords: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            date: Date;
            petId: string;
            nextDoseDate: Date | null;
        }[];
        clinicalRecords: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            date: Date;
            petId: string;
            type: import(".prisma/client").$Enums.ClinicalRecordType;
            title: string | null;
            content: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clinicId: string;
        species: string;
        breed: string | null;
        age: number | null;
        clientId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(clinicId: string, id: string, data: any): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    remove(clinicId: string, id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
