export interface TimelineEvent {
  id: string;
  type: 'APPOINTMENT' | 'VACCINE' | 'WEIGHT' | 'PRESCRIPTION' | 'ATTACHMENT' | 'CONSENT';
  occurredAt: Date;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'neutral';
  action?: {
      label: string;
      href: string; // Para Prescription e ConsentTerm, apontar para `/documento/:hash`
  };
}
