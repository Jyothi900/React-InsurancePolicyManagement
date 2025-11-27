import httpClient from './http';

export interface ProposalCreateDto {
  productId: string;
  sumAssured: number;
  premiumFrequency: number;
  isSmoker: boolean;
  termYears: number;
  height: number;
  weight: number;
  isDrinker: boolean;
  preExistingConditions: string;
  occupation: string;
  annualIncome: number;
}

export interface ProposalDto {
  proposalId: string;
  userId: string;
  productId: string;
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: number;
  status: string;
  appliedDate: string;
  reviewedDate?: string;
  isSmoker: boolean;
  termYears: number;
  height: number;
  weight: number;
  isDrinker: boolean;
  preExistingConditions: string;
  occupation: string;
  annualIncome: number;
}


export interface ProposalStatusResponse {
  proposalId: string;
  status: string;
  appliedDate: string;
  reviewedDate?: string;
  notes?: string;
  premiumAmount: number;
}

export const proposalApi = {
  submitProposal: async (userId: string, proposalData: ProposalCreateDto): Promise<ProposalDto> => {
    const payload = { userId, proposalData };
    const { data } = await httpClient.post<ProposalDto>('/api/Proposal/submit', payload);
    return data;
  },

  getAllProposals: async (): Promise<ProposalDto[]> => {
    const { data } = await httpClient.get<ProposalDto[]>('/api/Proposal');
    return data;
  },

  getMyProposals: async (userId: string): Promise<ProposalDto[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<ProposalDto[]>('/api/Proposal/my-proposals', payload);
    return data;
  },

  getProposalsByUserId: async (userId: string): Promise<ProposalDto[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<ProposalDto[]>('/api/Proposal/my-proposals', payload);
    return data;
  },

  getProposalById: async (proposalId: string): Promise<ProposalDto> => {
    const payload = { proposalId };
    const { data } = await httpClient.post<ProposalDto>('/api/Proposal/by-id', payload);
    return data;
  },

  getProposalStatus: async (proposalId: string): Promise<ProposalStatusResponse> => {
    const payload = { proposalId };
    const { data } = await httpClient.post<ProposalStatusResponse>('/api/Proposal/status-check', payload);
    return data;
  },

  getRequiredDocuments: async (proposalId: string): Promise<string[]> => {
    const payload = { proposalId };
    const { data } = await httpClient.post<string[]>('/api/Proposal/required-documents', payload);
    return data;
  },

  updateProposalStatus: async (proposalId: string, status: string, notes?: string): Promise<{ message: string }> => {
    const payload = { proposalId, status, notes };
    const { data } = await httpClient.patch<{ message: string }>('/api/Proposal/status', payload);
    return data;
  }
};