import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DocumentResponse, DocumentUploadRequest } from '../types/Document';
import { documentApi } from '../api/document.api';
interface DocumentState {
  myDocuments: DocumentResponse[];
  allDocuments: DocumentResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  myDocuments: [],
  allDocuments: [],
  loading: false,
  error: null
};

export const uploadDocument = createAsyncThunk(
  'document/upload',
  async (documentData: DocumentUploadRequest) => {
    return await documentApi.uploadDocument(documentData);
  }
);

export const fetchMyDocuments = createAsyncThunk(
  'document/fetchMy',
  async (userId: string) => {
    return await documentApi.getMyDocuments(userId);
  }
);

export const fetchPendingDocuments = createAsyncThunk(
  'document/fetchPending',
  async () => {
    return await documentApi.getPendingVerificationDocuments();
  }
);

export const verifyDocument = createAsyncThunk(
  'document/verify',
  async ({ documentId, isVerified, notes }: { documentId: string; isVerified: boolean; notes?: string }) => {
    await documentApi.verifyDocument({
      documentId,
      isVerified,
      verificationNotes: notes || ''
    });
    return { documentId, isVerified, notes };
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.myDocuments.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Upload failed';
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.myDocuments = action.payload;
      })
      .addCase(fetchPendingDocuments.fulfilled, (state, action) => {
        state.allDocuments = action.payload;
      })
      .addCase(verifyDocument.fulfilled, (state, action) => {
        const { documentId, isVerified } = action.payload;
        const document = state.allDocuments.find(doc => doc.documentId === documentId);
        if (document) {
          document.status = isVerified ? 'Verified' : 'Rejected';
        }
      });
  }
});


export const fetchAllDocuments = fetchPendingDocuments;

export const { clearError } = documentSlice.actions;
export default documentSlice.reducer;
