import { ClinicsService } from './clinics.service';
export declare class ClinicsController {
    private readonly clinicsService;
    constructor(clinicsService: ClinicsService);
    create(createClinicDto: any): import(".prisma/client").Prisma.Prisma__ClinicClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ClinicClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateClinicDto: any): import(".prisma/client").Prisma.Prisma__ClinicClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ClinicClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
