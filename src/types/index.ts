// Re-export all types from Policy.ts
export type * from './Policy';

// Re-export types from Common.ts
export type {
  UserRole,
  Gender,
  KYCStatus,
  Status,
  InsuranceType,
  DocumentType,
  ClaimType,
  PaymentMethod,
  PaymentStatus,
  ProposalStatus,
  PolicyStatus,
  ClaimStatus,
  RiskLevel
} from './Common';

// Re-export from User.ts
export type * from './User';