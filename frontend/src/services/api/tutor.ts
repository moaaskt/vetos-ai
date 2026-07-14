import { api } from '../../lib/api';

export interface TimelineEvent {
  id: string;
  type: 'APPOINTMENT' | 'VACCINE' | 'WEIGHT' | 'PRESCRIPTION' | 'ATTACHMENT' | 'CONSENT';
  occurredAt: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'neutral';
  action?: {
    label: string;
    href: string;
  };
}

export interface TutorProfile {
  id: string;
  name: string;
  primaryEmail?: string;
  primaryWhatsapp?: string;
  preferredChannel: string;
  locale: string;
  timezone: string;
  cpf?: string;
}

export interface TutorPet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  clinic: {
    name: string;
  };
}

export const tutorApi = {
  getProfile: async (): Promise<TutorProfile> => {
    const response = await api.get('/tutor/me');
    return response.data;
  },

  getPets: async (): Promise<TutorPet[]> => {
    const response = await api.get('/tutor/pets');
    return response.data;
  },

  getPetDetails: async (id: string): Promise<any> => {
    const response = await api.get(`/tutor/pets/${id}`);
    return response.data;
  },

  getPetTimeline: async (id: string): Promise<TimelineEvent[]> => {
    const response = await api.get(`/tutor/pets/${id}/timeline`);
    return response.data;
  },
};
