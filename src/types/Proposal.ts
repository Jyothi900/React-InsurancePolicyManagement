import type { PremiumFrequency, Status } from './Common';

export interface Proposal {
  proposalId: string;
  userId: string;
  productId: string;
  agentId?: string;
  sumAssured: number; 
  termYears: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  height: number;
  weight: number;
  isSmoker: boolean;
  isDrinker: boolean;
  preExistingConditions: string;
  occupation: string;
  annualIncome: number;
  status: Status; 
  underwritingNotes?: string;
  appliedDate: string; 
  reviewedDate?: string; 
}

export interface CreateProposalRequest {
  productId: string;
  sumAssured: number;
  termYears: number;
  premiumFrequency: PremiumFrequency;
  height: number;
  weight: number;
  isSmoker: boolean;
  isDrinker: boolean;
  preExistingConditions: string;
  occupation: string;
  annualIncome: number;
}

export interface UpdateProposalStatusRequest {
  proposalId: string;
  status: Status;
  underwritingNotes?: string;
}

export type ProposalResponse = Proposal;

export interface ProposalStatusResponse {
  proposalId: string;
  status: Status;
  underwritingNotes?: string;
  appliedDate: string;
  reviewedDate?: string;
}
