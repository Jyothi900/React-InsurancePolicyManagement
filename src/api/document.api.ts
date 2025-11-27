import httpClient from './http';
import type{
  DocumentResponse,
  DocumentUploadRequest,
  KYCDocumentUploadRequest,
 KYCUploadResponse
} from '../types/Document';


export const documentApi = {
 
  uploadDocument: async (uploadData: DocumentUploadRequest): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('UserId', uploadData.userId);
    formData.append('DocumentType', uploadData.documentType.toString());
    formData.append('File', uploadData.file);
    
    if (uploadData.proposalId) formData.append('ProposalId', uploadData.proposalId);
    if (uploadData.policyId) formData.append('PolicyId', uploadData.policyId);
    if (uploadData.claimId) formData.append('ClaimId', uploadData.claimId);

    const { data } = await httpClient.post<DocumentResponse>('/api/document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

 
  uploadKYC: async (formData: FormData): Promise<KYCUploadResponse> => {
    const { data } = await httpClient.post<KYCUploadResponse>('/api/document/upload-kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },


  uploadKYCDocuments: async (kycData: KYCDocumentUploadRequest): Promise<KYCUploadResponse> => {
    const formData = new FormData();
    formData.append('UserId', kycData.userId);
    
    if (kycData.aadhaarFile) formData.append('AadhaarFile', kycData.aadhaarFile);
    if (kycData.aadhaarNumber) formData.append('AadhaarNumber', kycData.aadhaarNumber);
    
    if (kycData.panFile) formData.append('PANFile', kycData.panFile);
    if (kycData.panNumber) formData.append('PANNumber', kycData.panNumber);
    
    if (kycData.bankName) formData.append('BankName', kycData.bankName);
    if (kycData.accountNumber) formData.append('AccountNumber', kycData.accountNumber);
    if (kycData.ifscCode) formData.append('IFSCCode', kycData.ifscCode);
    if (kycData.accountHolderName) formData.append('AccountHolderName', kycData.accountHolderName);

    const { data } = await httpClient.post<KYCUploadResponse>('/api/document/upload-kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },


  getMyDocuments: async (userId: string): Promise<DocumentResponse[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<DocumentResponse[]>('/api/document/my-documents', payload);
    return data;
  },


  getDocumentsByProposal: async (proposalId: string): Promise<DocumentResponse[]> => {
    const payload = { proposalId };
    const { data } = await httpClient.post<DocumentResponse[]>('/api/document/by-proposal', payload);
    return data;
  },


  getDocumentsByPolicy: async (policyId: string): Promise<DocumentResponse[]> => {
    const payload = { policyId };
    const { data } = await httpClient.post<DocumentResponse[]>('/api/document/by-policy', payload);
    return data;
  },


  getDocumentsByClaim: async (claimId: string): Promise<DocumentResponse[]> => {
    const payload = { claimId };
    const { data } = await httpClient.post<DocumentResponse[]>('/api/document/by-claim', payload);
    return data;
  },

  getPendingVerificationDocuments: async (): Promise<DocumentResponse[]> => {
    const { data } = await httpClient.get<DocumentResponse[]>('/api/Document/pending-verification');
    return data;
  },

 
  getAllForVerification: async (): Promise<DocumentResponse[]> => {
    const { data } = await httpClient.get<DocumentResponse[]>('/api/Document/all-for-verification');
    return data;
  },

  getDocumentById: async (documentId: string): Promise<DocumentResponse> => {
    const payload = { documentId };
    const { data } = await httpClient.post<DocumentResponse>('/api/document/by-id', payload);
    return data;
  },


  downloadDocument: async (documentId: string): Promise<Blob> => {
    const payload = { documentId };
    const { data } = await httpClient.post('/api/document/download', payload, {
      responseType: 'blob'
    });
    return data;
  },

  deleteDocument: async (documentId: string, userId: string): Promise<void> => {
    const payload = { documentId, userId };
    await httpClient.delete('/api/document/delete', { data: payload });
  },

  verifyDocument: async (verificationData: {
    documentId: string;
    isVerified: boolean;
    verificationNotes: string;
  }): Promise<void> => {
    await httpClient.post('/api/document/verify', verificationData);
  },
};
