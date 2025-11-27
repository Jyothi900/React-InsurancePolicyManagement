import httpClient from './http';

export interface UnderwriterDashboard {
  PendingCases: number;
  PendingDocuments: number;
  PendingProposals: number;
  TotalWorkload: number;
}

export interface UnderwritingCase {
  CaseId: string;
  UserId: string;
  CaseType: string;
  Priority: string;
  Status: string;
  AssignedAt: string;
  DaysPending: number;
}

export interface CaseDecision {
  CaseId: string;
  Decision: string;
  DecisionReason: string;
  ApprovedSumAssured?: number;
}

export interface DocumentDecision {
  VerificationId: string;
  IsVerified: boolean;
  VerificationNotes: string;
}

export interface AssignedCustomer {
  userId: string;
  fullName: string;
  email: string;
  kycStatus: string;
  assignedAt: string;
  pendingDocuments: number;
}

export const underwriterApi = {

  getDashboard: async (underwriterId: string): Promise<UnderwriterDashboard> => {
    const payload = { underwriterId };
    const { data } = await httpClient.post<UnderwriterDashboard>('/api/Underwriter/dashboard', payload);
    return data;
  },

  getPendingCases: async (underwriterId: string): Promise<UnderwritingCase[]> => {
    const payload = { underwriterId };
    const { data } = await httpClient.post<UnderwritingCase[]>('/api/Underwriter/cases/pending', payload);
    return data;
  },

  processCase: async (decision: CaseDecision): Promise<any> => {
    const { data } = await httpClient.post('/api/Underwriter/cases/decision', decision);
    return data;
  },

  getPendingDocuments: async (underwriterId: string): Promise<any[]> => {
    const payload = { underwriterId };
    const { data } = await httpClient.post('/api/Underwriter/documents/pending', payload);
    return data;
  },

  verifyDocument: async (decision: DocumentDecision): Promise<any> => {
    const { data } = await httpClient.post('/api/Underwriter/documents/verify', decision);
    return data;
  },

  updateKYCStatus: async (userId: string, status: string, notes?: string): Promise<any> => {
    const payload = { userId, status, notes };
    const { data } = await httpClient.patch('/api/Underwriter/kyc-status', payload);
    return data;
  },

  getAssignedCustomers: async (underwriterId: string): Promise<AssignedCustomer[]> => {
    const payload = { underwriterId };
    const { data } = await httpClient.post('/api/Underwriter/assigned-customers', payload);
    return data;
  },

  getPendingProposals: async (): Promise<any[]> => {
    const { data } = await httpClient.get('/api/Underwriter/proposals/pending');
    return data;
  },

  updateProposalStatus: async (proposalId: string, status: string, notes?: string): Promise<{ message: string }> => {
    const payload = { proposalId, status, notes };
    const { data } = await httpClient.patch<{ message: string }>('/api/Underwriter/proposals/status', payload);
    return data;
  },
};