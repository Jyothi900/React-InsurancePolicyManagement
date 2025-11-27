import httpClient from './http';
import type { Policy } from '../types/Policy';
import type { Claim } from '../types/Claim';
import type { DuePremiumResponse } from '../types/Payment';

export interface DashboardData {
  policies: Policy[];
  claims: Claim[];
  duePremiums: DuePremiumResponse[];
  summary: {
    totalCoverage: number;
    activePolicies: number;
    pendingClaims: number;
    duePayments: number;
  };
}

export const dashboardApi = {

  getDashboardData: async (userId: string): Promise<DashboardData> => {
    const payload = { userId };
    const { data } = await httpClient.post<DashboardData>('/api/dashboard/customer-data', payload);
    return data;
  },

  getAdminDashboard: async (): Promise<any> => {
    const { data } = await httpClient.get('/api/dashboard/admin-data');
    return data;
  },

 
  getAgentDashboard: async (agentId: string): Promise<any> => {
    const payload = { agentId }; 
    const { data } = await httpClient.post('/api/dashboard/agent-data', payload);
    return data;
  },

  getUnderwriterDashboard: async (underwriterId: string): Promise<any> => {
    const payload = { underwriterId };
    const { data } = await httpClient.post('/api/dashboard/underwriter-data', payload);
    return data;
  }
};