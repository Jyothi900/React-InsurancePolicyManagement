
import type { AllClaimTypes, CauseOfDeath, UnifiedRelationship, Status } from './Common';

export interface Claim {
  claimId: string;
  claimNumber: string;
  policyId: string;
  userId: string; 
  agentId?: string; 
  underwriterId?: string; 
  claimType: AllClaimTypes; 
  claimAmount: number;
  approvedAmount?: number;
  status: Status; 
  incidentDate: string; 
  filedDate: string; 
  processedDate?: string; 
  causeOfDeath?: CauseOfDeath;
  claimantName?: string;
  claimantRelation?: UnifiedRelationship; 
  claimantBankDetails?: string;
  investigationNotes?: string;
  rejectionReason?: string;
  requiresInvestigation: boolean;
}


export interface ClaimCreateRequest {
  policyId: string;
  claimType: AllClaimTypes; 
  incidentDate: string; 
  causeOfDeath: CauseOfDeath; 
  claimantName: string;
  claimantRelation: UnifiedRelationship; 
  claimantBankDetails: string;
}




export type ClaimResponse = Claim;


export interface ClaimStatusResponse {
  claimId: string;
  claimNumber: string;
  status: Status;
  investigationNotes?: string;
  approvedAmount?: number;
  filedDate: string;
  processedDate?: string;
}

export interface ClaimTimelineItem {
  date: string;
  status: Status;
  notes?: string;
  updatedBy?: string;
}
