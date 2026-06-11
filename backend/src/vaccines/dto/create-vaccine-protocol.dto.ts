export class CreateVaccineProtocolDoseDto {
  vaccineName!: string;
  doseOrder!: number;
  intervalDays!: number;
}

export class CreateVaccineProtocolDto {
  name!: string;
  species!: string;
  doses!: CreateVaccineProtocolDoseDto[];
}
