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
        vaccineRecords: ({
            protocolDose: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                protocolId: string;
                vaccineName: string;
                doseOrder: number;
                intervalDays: number;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            date: Date;
            status: import(".prisma/client").$Enums.VaccineStatus;
            petId: string;
            nextDoseDate: Date | null;
            protocolId: string | null;
            protocolDoseId: string | null;
            lotNumber: string | null;
            manufacturer: string | null;
            appliedById: string | null;
            notes: string | null;
        })[];
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
        prescriptions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            petId: string;
            medicamento: string;
            dosagem: string;
            frequencia: string;
            duracao: string;
            viaAdministracao: string;
            observacoes: string | null;
            documentHash: string | null;
            signedAt: Date | null;
            verificationUrl: string | null;
            verificationQrCode: string | null;
            lastSharedAt: Date | null;
            clinicalRecordId: string | null;
            appointmentId: string | null;
        }[];
        consentTerms: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clinicId: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            petId: string;
            documentHash: string | null;
            signedAt: Date | null;
            verificationUrl: string | null;
            verificationQrCode: string | null;
            lastSharedAt: Date | null;
            appointmentId: string | null;
            consentTemplateId: string | null;
            finalText: string;
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
