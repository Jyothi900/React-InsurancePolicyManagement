import httpClient from './http';

import type { Claim, ClaimCreateRequest } from '../types/Claim';
import type { Status } from '../types/Common';

export interface ClaimStatusResponse {
  claimId: string;
  claimNumber: string;
  status: Status;
  investigationNotes?: string;
  approvedAmount?: number;
  filedDate: string;
  processedDate?: string;
}

export const claimApi = {
 
  getAllClaims: async (): Promise<Claim[]> => {
    const { data } = await httpClient.get<Claim[]>('/api/claim');
    return data;
  },


  fileClaim: async (userId: string, claimData: ClaimCreateRequest): Promise<Claim> => {
    const payload = { UserId: userId, ClaimData: claimData };
    const { data } = await httpClient.post<Claim>('/api/claim/file', payload);
    return data;
  },


  getMyClaims: async (userId: string): Promise<Claim[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<Claim[]>('/api/claim/my-claims', payload);
    return data;
  },


  getClaimStatus: async (claimNumber: string): Promise<ClaimStatusResponse> => {
    const payload = { claimNumber };
    const { data } = await httpClient.post<ClaimStatusResponse>('/api/claim/status-check', payload);
    return data;
  },

  getRequiredDocuments: async (claimNumber: string): Promise<string[]> => {
    const payload = { claimNumber };
    const { data } = await httpClient.post<string[]>('/api/claim/required-documents', payload);
    return data;
  },

  getClaimTimeline: async (claimNumber: string): Promise<any[]> => {
    const payload = { claimNumber };
    const { data } = await httpClient.post<any[]>('/api/claim/timeline', payload);
    return data;
  },

  updateClaimStatus: async (claimId: string, status: string, notes?: string): Promise<{ message: string }> => {
    const payload = { claimId, status, notes };
    const { data } = await httpClient.patch<{ message: string }>('/api/claim/status', payload);
    return data;
  },


  approveClaim: async (claimId: string, approvedAmount: number): Promise<{ message: string }> => {
    const payload = { claimId, approvedAmount };
    const { data } = await httpClient.post<{ message: string }>('/api/claim/approve', payload);
    return data;
  }
};