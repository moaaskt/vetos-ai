import { ClinicalRecordType } from '@prisma/client';

export class CreateClinicalRecordDto {
  type!: ClinicalRecordType;
  title?: string;
  content!: string;
  date?: string;
  petId!: string;
}
