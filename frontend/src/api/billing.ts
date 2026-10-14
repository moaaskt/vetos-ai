import { api } from '../lib/api';

export interface SaaSPlan {
  id: string;
  name: string;
  maxStaffSeats: number;
  maxNotifications: number;
  maxStorage: number;
  features: string[];
}

export interface ResourceUsageMetrics {
  plan: {
    id: string;
    name: string;
    features: string[];
  };
  subscriptionId: string;
  metrics: {
    staff: {
      used: number;
      limit: number;
      percentage: number;
      isExceeded: boolean;
    };
    notifications: {
      used: number;
      limit: number;
      percentage: number;
      isExceeded: boolean;
      resetDate: string;
    };
    storage: {
      usedMB: number;
      limitMB: number;
      percentage: number;
      isExceeded: boolean;
    };
  };
}

export interface ChangePlanResponse {
  success: boolean;
  message: string;
  subscription: any;
}

export const billingApi = {
  getSubscription: async (): Promise<ResourceUsageMetrics> => {
    const response = await api.get('/billing/subscription');
    return response.data;
  },

  getPlans: async (): Promise<SaaSPlan[]> => {
    const response = await api.get('/billing/plans');
    return response.data;
  },

  changePlan: async (planId: string): Promise<ChangePlanResponse> => {
    const response = await api.post('/billing/change-plan', { planId });
    return response.data;
  },
};
