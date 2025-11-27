import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { policyApi } from "../api/policy.api";
import type { Policy } from "../types/Policy";

type PolicyState = {
  policies: Policy[];
  selectedPolicy: Policy | null;
  premiumSchedule: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  policies: [],
  selectedPolicy: null,
  premiumSchedule: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchMyPolicies = createAsyncThunk(
  'policy/fetchMyPolicies',
  async (userId: string) => {
    return await policyApi.getMyPolicies(userId);
  }
);

export const fetchPolicyById = createAsyncThunk(
  'policy/fetchById',
  async (policyId: string) => {
    return await policyApi.getPolicyById(policyId);
  }
);

export const fetchPremiumSchedule = createAsyncThunk(
  'policy/fetchPremiumSchedule',
  async (policyId: string) => {
    return await policyApi.getPremiumSchedule(policyId);
  }
);

export const downloadPolicyPDF = createAsyncThunk(
  'policy/downloadPDF',
  async (policyId: string) => {
    return await policyApi.downloadPolicyPDF(policyId);
  }
);

export const surrenderPolicy = createAsyncThunk(
  'policy/surrender',
  async ({ policyId, userId }: { policyId: string; userId: string }) => {
    return await policyApi.surrenderPolicy(policyId, userId);
  }
);

export const revivePolicy = createAsyncThunk(
  'policy/revive',
  async ({ policyId, userId }: { policyId: string; userId: string }) => {
    return await policyApi.revivePolicy(policyId, userId);
  }
);

export const issueFromProposal = createAsyncThunk(
  'policy/issueFromProposal',
  async (proposalId: string) => {
    return await policyApi.issueFromProposal(proposalId);
  }
);

export const fetchAllPoliciesForAdmin = createAsyncThunk(
  'policy/fetchAllForAdmin',
  async () => {
    return await policyApi.getAllPoliciesForAdmin();
  }
);



export const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {
    setSelectedPolicy: (state, action: PayloadAction<Policy>) => {
      state.selectedPolicy = action.payload;
    },
    clearSelectedPolicy: (state) => {
      state.selectedPolicy = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchMyPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
        state.error = null;
      })
      .addCase(fetchMyPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch policies';
        state.policies = [];
      })

      .addCase(fetchPolicyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPolicy = action.payload;
      })

      .addCase(fetchPremiumSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPremiumSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.premiumSchedule = action.payload;
      })

      .addCase(surrenderPolicy.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(revivePolicy.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(issueFromProposal.fulfilled, (state, action) => {
        state.policies.push(action.payload);
      })
      .addCase(fetchAllPoliciesForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPoliciesForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchAllPoliciesForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch policies';
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('policy/'),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message || 'Operation failed';
        }
      );
  },
});

export const { 
  setSelectedPolicy, 
  clearSelectedPolicy, 
  clearError 
} = policySlice.actions;
export default policySlice.reducer;
export { fetchMyPolicies as getMyPolicies };