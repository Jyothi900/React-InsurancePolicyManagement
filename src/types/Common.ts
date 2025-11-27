
export type UserRole = number;
export type Gender = number;
export type KYCStatus = number;
export type Status = number;
export type PolicyType = number;
export type InsuranceType = number;
export type PremiumFrequency = number;
export type DocumentType = number;
export type AllClaimTypes = number;
export type CauseOfDeath = number;
export type UnifiedRelationship = number;
export type ClaimType = number;
export type PaymentMethod = number;
export type PaymentStatus = string;
export type ProposalStatus = string;
export type PolicyStatus = string;
export type ClaimStatus = string;
export type RiskLevel = string;


export const UserRoleNames = {
  0: 'Customer',
  1: 'Agent', 
  2: 'Admin',
  3: 'Underwriter'
} as const;

export interface BaseResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
