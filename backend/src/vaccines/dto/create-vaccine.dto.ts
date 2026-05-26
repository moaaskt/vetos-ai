export class CreateVaccineDto {
  name!: string;
  date!: string;
  nextDoseDate?: string;
  petId!: string;
}
