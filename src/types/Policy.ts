
import type { Status } from './Common';

export type PolicyType = 0 | 1 | 2 | 3 | 4 | 5 | 6; // TermLife=0, Endowment=1, ULIP=2, MoneyBack=3, Pension=4, ChildPlan=5, PersonalAccident=6
export type PremiumFrequency = 0 | 1 | 2 | 3; // Monthly=0, Quarterly=1, HalfYearly=2, Annual=3


export type Policy = {
  policyId: string;
  policyNumber?: string;
  userId: string;
  productId: string;
  agentId?: string;
  policyType: PolicyType; 
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency; 
  termYears: number;
  startDate: string;
  expiryDate?: string;
  nextPremiumDue?: string;
  status: Status;
  issuedDate: string;
}


export type PolicyCreateRequest = {
  userId: string;
  productId: string;
  agentId?: string;
  policyType: PolicyType; 
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency; 
  termYears: number;
}

export type PolicyUpdateRequest = {
  policyId: string;
  status?: Status;
  nextPremiumDue?: string;
}

export type ProposalCreateRequest = {
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
  preExistingConditions?: string;
  occupation?: string;
  annualIncome: number;
}

export type ProposalResponse = {
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
  preExistingConditions?: string;
  occupation?: string;
  annualIncome: number;
  status: Status; 
  underwritingNotes?: string;
  appliedDate: string;
  reviewedDate?: string;
}

export type ProposalStatusResponse = {
  proposalId: string;
  status: Status;
  lastUpdated: string;
  notes?: string;
}

export type PolicyResponse = Policy;


export type PremiumScheduleResponse = {
  policyId: string;
  schedules: PremiumScheduleItem[];
}

export type PremiumScheduleItem = {
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
  paidDate?: string;
}
