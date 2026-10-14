import { api } from '../lib/api';

export type VaccineWindow = 'D0' | 'D-1' | 'D-7' | 'OVERDUE' | 'UPCOMING';

export interface UpcomingVaccineReminder {
  id: string;
  name: string;
  date: string;
  nextDoseDate: string | null;
  targetDate: string;
  status: 'APPLIED' | 'SCHEDULED';
  window: VaccineWindow;
  daysUntilDue: number;
  lotNumber?: string | null;
  manufacturer?: string | null;
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    client: {
      id: string;
      name: string;
      email?: string | null;
      phone?: string | null;
    };
  };
  protocol?: {
    id: string;
    name: string;
  } | null;
  protocolDose?: {
    doseOrder: number;
  } | null;
  lastNotification?: {
    id: string;
    channel: 'EMAIL' | 'WHATSAPP';
    status: 'PENDING' | 'SENT' | 'FAILED';
    sentAt?: string | null;
    createdAt: string;
  } | null;
}

export interface VaccineConversionStats {
  days: number;
  totalNotificationsSent: number;
  appliedDosesCount: number;
  overdueCount: number;
  criticalOverdueCount: number;
  notifiedVaccinesCount: number;
  appliedAfterNotificationCount: number;
  conversionRate: number;
}

export interface RemindersFilterParams {
  window?: 'D0' | 'D-1' | 'D-7' | 'OVERDUE' | 'ALL';
  search?: string;
}

export interface TriggerReminderPayload {
  channels?: ('EMAIL' | 'WHATSAPP')[];
}

export interface TriggerReminderResponse {
  success: boolean;
  vaccineId: string;
  channels: string[];
  message: string;
}

export const vaccinesApi = {
  getUpcomingReminders: async (params?: RemindersFilterParams): Promise<UpcomingVaccineReminder[]> => {
    const response = await api.get('/vaccines/reminders/upcoming', { params });
    return response.data;
  },

  triggerReminder: async (
    vaccineId: string,
    channels?: ('EMAIL' | 'WHATSAPP')[],
  ): Promise<TriggerReminderResponse> => {
    const response = await api.post(`/vaccines/reminders/${vaccineId}/trigger`, {
      channels,
    });
    return response.data;
  },

  getConversionStats: async (days = 30): Promise<VaccineConversionStats> => {
    const response = await api.get('/vaccines/analytics/conversion', {
      params: { days },
    });
    return response.data;
  },
};
