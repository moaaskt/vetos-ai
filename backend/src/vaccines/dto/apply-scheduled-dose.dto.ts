export class ApplyScheduledDoseDto {
  date!: string;
  lotNumber?: string;
  manufacturer?: string;
  appliedById?: string;
  notes?: string;
  recalculateSubsequent?: boolean;
}
