import { api } from '../lib/api';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationConfig {
  id: string;
  clinicId: string;
  emailEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromName: string | null;
  smtpFromEmail: string | null;
  whatsappEnabled: boolean;
  whatsappInstanceUrl: string | null;
  whatsappInstanceName: string | null;
  hasSmtpPassword: boolean;
  hasWhatsappApiKey: boolean;
}

export interface UpdateNotificationConfigPayload {
  emailEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  whatsappEnabled?: boolean;
  whatsappInstanceUrl?: string;
  whatsappInstanceName?: string;
  whatsappApiKey?: string;
}

export interface NotificationTemplate {
  id: string;
  clinicId: string;
  event: string;
  channel: NotificationChannel;
  subject: string | null;
  body: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationTemplatePayload {
  event: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  active: boolean;
}

export interface NotificationLog {
  id: string;
  clinicId: string;
  channel: NotificationChannel;
  to: string;
  subject: string | null;
  body: string;
  status: NotificationStatus;
  errorMessage: string | null;
  providerMessageId: string | null;
  event: string;
  scheduledFor: string | null;
  sentAt: string | null;
  appointmentId: string | null;
  clientId: string | null;
  petId: string | null;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    date: string;
    reason: string | null;
    pet: { name: string } | null;
    client: { name: string } | null;
  } | null;
  client?: { name: string } | null;
  pet?: { name: string } | null;
}

export interface PaginatedLogsResponse {
  items: NotificationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  status?: string;
  channel?: string;
  event?: string;
  to?: string;
}

export const notificationsApi = {
  getConfig: async (): Promise<NotificationConfig> => {
    const response = await api.get<NotificationConfig>('/notifications/config');
    return response.data;
  },

  updateConfig: async (payload: UpdateNotificationConfigPayload): Promise<NotificationConfig> => {
    const response = await api.patch<NotificationConfig>('/notifications/config', payload);
    return response.data;
  },

  testSmtpConnection: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>('/notifications/config/test-smtp');
    return response.data;
  },

  sendTestEmail: async (to: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>('/notifications/config/send-test-email', { to });
    return response.data;
  },

  testWhatsappConnection: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>('/notifications/config/test-whatsapp');
    return response.data;
  },

  sendTestWhatsapp: async (to: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>('/notifications/config/send-test-whatsapp', { to });
    return response.data;
  },

  createWhatsappInstance: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>('/notifications/config/whatsapp/create-instance');
    return response.data;
  },

  getWhatsappQr: async (): Promise<{ code?: string; base64?: string; pairingCode?: string; success: boolean; message?: string }> => {
    const response = await api.get<{ code?: string; base64?: string; pairingCode?: string; success: boolean; message?: string }>('/notifications/config/whatsapp/qr');
    return response.data;
  },

  getWhatsappStatus: async (): Promise<{ state: string; success: boolean }> => {
    const response = await api.get<{ state: string; success: boolean }>('/notifications/config/whatsapp/status');
    return response.data;
  },

  deleteWhatsappConfig: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete<{ success: boolean; message?: string }>('/notifications/config/whatsapp');
    return response.data;
  },

  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await api.get<NotificationTemplate[]>('/notifications/templates');
    return response.data;
  },

  updateTemplate: async (payload: UpdateNotificationTemplatePayload): Promise<NotificationTemplate> => {
    const response = await api.put<NotificationTemplate>('/notifications/templates', payload);
    return response.data;
  },

  getLogs: async (params?: GetLogsParams): Promise<PaginatedLogsResponse> => {
    const response = await api.get<PaginatedLogsResponse>('/notifications/logs', { params });
    return response.data;
  },

  retryNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(`/notifications/logs/${id}/retry`);
    return response.data;
  },
};
