import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { claimApi } from "../api/claim.api";

import type { ClaimStatusResponse } from "../api/claim.api";
import type { Claim, ClaimCreateRequest } from "../types/Claim";

type ClaimState = {
  claims: Claim[];
  myClaims: Claim[];
  selectedClaim: Claim | null;
  claimStatus: ClaimStatusResponse | null;
  requiredDocuments: string[];
  claimTimeline: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ClaimState = {
  claims: [],
  myClaims: [],
  selectedClaim: null,
  claimStatus: null,
  requiredDocuments: [],
  claimTimeline: [],
  loading: false,
  error: null
}

export const fetchAllClaims = createAsyncThunk(
  'claim/fetchAll',
  async () => {
    return await claimApi.getAllClaims();
  }
);

export const fetchMyClaims = createAsyncThunk(
  'claim/fetchMyClaims',
  async (userId: string) => {
    const claims = await claimApi.getMyClaims(userId);
    return claims;
  }
);

export const fileClaim = createAsyncThunk(
  'claim/file',
  async ({ userId, claimData }: { userId: string; claimData: ClaimCreateRequest }) => {
    return await claimApi.fileClaim(userId, claimData);
  }
);

export const fetchClaimStatus = createAsyncThunk(
  'claim/fetchStatus',
  async (claimNumber: string) => {
    return await claimApi.getClaimStatus(claimNumber);
  }
);

export const fetchRequiredDocuments = createAsyncThunk(
  'claim/fetchRequiredDocuments',
  async (claimNumber: string) => {
    return await claimApi.getRequiredDocuments(claimNumber);
  }
);

export const fetchClaimTimeline = createAsyncThunk(
  'claim/fetchTimeline',
  async (claimNumber: string) => {
    return await claimApi.getClaimTimeline(claimNumber);
  }
);

export const updateClaimStatus = createAsyncThunk(
  'claim/updateStatus',
  async ({ claimId, status, notes }: { claimId: string; status: string; notes?: string }) => {
    return await claimApi.updateClaimStatus(claimId, status, notes);
  }
);

export const approveClaim = createAsyncThunk(
  'claim/approve',
  async ({ claimId, approvedAmount }: { claimId: string; approvedAmount: number }) => {
    return await claimApi.approveClaim(claimId, approvedAmount);
  }
);



export const claimSlice = createSlice({
  name: 'claim',
  initialState,
  reducers: {
    setSelectedClaim: (state, action: PayloadAction<Claim>) => {
      state.selectedClaim = action.payload;
    },
    clearSelectedClaim: (state) => {
      state.selectedClaim = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllClaims.fulfilled, (state, action) => {
        state.loading = false;
        const uniqueClaims = action.payload.filter((claim, index, self) => 
          index === self.findIndex(c => c.claimId === claim.claimId)
        );
        state.claims = uniqueClaims;
      })
      .addCase(fetchAllClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch claims';
      })
      .addCase(fetchMyClaims.fulfilled, (state, action) => {
        state.myClaims = action.payload;
      })
      .addCase(fileClaim.pending, (state) => {
        state.loading = true;
      })
      .addCase(fileClaim.fulfilled, (state, action) => {
        state.loading = false;
        state.myClaims.push(action.payload);
      })
      .addCase(fileClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to file claim';
      })
      .addCase(fetchClaimStatus.fulfilled, (state, action) => {
        state.claimStatus = action.payload;
      })

      .addCase(fetchRequiredDocuments.fulfilled, (state, action) => {
        state.requiredDocuments = action.payload;
      })
      .addCase(fetchClaimTimeline.fulfilled, (state, action) => {
        state.claimTimeline = action.payload;
      })
      .addCase(updateClaimStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveClaim.fulfilled, (state) => {
        state.loading = false;
      })
;
  },
});

export const { 
  setSelectedClaim, 
  clearSelectedClaim, 
  clearError 
} = claimSlice.actions;
export default claimSlice.reducer;

