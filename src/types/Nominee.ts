
export interface Nominee {
  nomineeId: string;
  proposalId?: string;
  policyId?: string;
  fullName: string;
  relationship: string; 
  dateOfBirth: string; 
  sharePercentage: number;
  aadhaarNumber?: string;
  address: string;
  createdAt: string; 
}

// Request interfaces
export interface NomineeCreateRequest {
  proposalId?: string;
  policyId?: string;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  aadhaarNumber?: string;
  address: string;
}

export interface NomineeUpdateRequest {
  nomineeId: string;
  fullName?: string;
  relationship?: string;
  dateOfBirth?: string;
  sharePercentage?: number;
  aadhaarNumber?: string;
  address?: string;
}

// Response interfaces
export type NomineeResponse = Nominee;
