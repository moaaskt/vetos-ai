export class CreatePrescriptionDto {
  medicamento!: string;
  dosagem!: string;
  frequencia!: string;
  duracao!: string;
  viaAdministracao!: string;
  observacoes?: string;
  petId!: string;
  clinicalRecordId?: string;
  appointmentId?: string;
}
