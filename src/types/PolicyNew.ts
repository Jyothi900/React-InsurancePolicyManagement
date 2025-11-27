
import type { Status } from './Common';

export type PolicyType = 'TermLife' | 'Endowment' | 'ULIP' | 'MoneyBack' | 'Pension' | 'ChildPlan' | 'PersonalAccident';
export type PremiumFrequency = 'Monthly' | 'Quarterly' | 'HalfYearly' | 'Annual';



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