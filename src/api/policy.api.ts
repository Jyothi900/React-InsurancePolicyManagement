import httpClient from './http';
import type { Policy } from '../types/Policy';


export const policyApi = {
 
  getMyPolicies: async (userId: string): Promise<Policy[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<Policy[]>('/api/policy/my-policies', payload);
    return data;
  },


  getPolicyById: async (policyId: string): Promise<Policy> => {
    const payload = { policyId };
    const { data } = await httpClient.post<Policy>('/api/policy/by-id', payload);
    return data;
  },

 
  downloadPolicyPDF: async (policyId: string): Promise<Blob> => {
    const payload = { policyId };
    const { data } = await httpClient.post('/api/policy/download-pdf', payload, {
      responseType: 'blob'
    });
    return data;
  },

  getPremiumSchedule: async (policyId: string): Promise<any[]> => {
    const payload = { policyId };
    const { data } = await httpClient.post<any[]>('/api/policy/premium-schedule', payload);
    return data;
  },


  surrenderPolicy: async (policyId: string, userId: string): Promise<{ message: string }> => {
    const payload = { policyId, userId };
    const { data } = await httpClient.post<{ message: string }>('/api/policy/surrender', payload);
    return data;
  },

  revivePolicy: async (policyId: string, userId: string): Promise<{ message: string }> => {
    const payload = { policyId, userId };
    const { data } = await httpClient.post<{ message: string }>('/api/policy/revive', payload);
    return data;
  },


  issueFromProposal: async (proposalId: string): Promise<Policy> => {
    const payload = { proposalId };
    const { data } = await httpClient.post<Policy>('/api/policy/issue-from-proposal', payload);
    return data;
  },

  getAllPoliciesForAdmin: async (): Promise<Policy[]> => {
    const { data } = await httpClient.get<Policy[]>('/api/policy/admin/all');
    return data;
  }
};