import { PetsService } from './pets.service';
export declare class PetsController {
    private readonly petsService;
    constructor(petsService: PetsService);
    create(user: any, createPetDto: any): import(".prisma/client").Prisma.Prisma__PetClient<{
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
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(user: any, id: string): import(".prisma/client").Prisma.Prisma__PetClient<({
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
    update(user: any, id: string, updatePetDto: any): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    remove(user: any, id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
