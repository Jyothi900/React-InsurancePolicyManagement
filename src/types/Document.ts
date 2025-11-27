import type { DocumentType } from './Common';


export interface Document {
  documentId: string;
  userId: string;
  proposalId?: string;
  policyId?: string;
  claimId?: string;
  documentType: string; 
  fileName: string;
  filePath: string;
  fileHash?: string;
  status: string; 
  verificationNotes?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface DocumentUploadRequest {
  userId: string;
  proposalId?: string;
  policyId?: string;
  claimId?: string;
  documentType: DocumentType;
  file: File;
}

export interface KYCDocumentUploadRequest {
  userId: string;
  aadhaarFile?: File;
  aadhaarNumber?: string;
  panFile?: File;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}


export type DocumentResponse = Document;

export interface KYCUploadResponse {
  message: string;
  uploadedDocuments: string[];
  kycStatus: string;
}
