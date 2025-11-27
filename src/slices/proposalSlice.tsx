import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { proposalApi } from "../api/proposal.api";
import type { Proposal, ProposalStatusResponse } from "../types/Proposal";
import type { ProposalDto, ProposalCreateDto } from "../api/proposal.api";
import type { Status, PremiumFrequency } from "../types/Common";

type ProposalState = {
  allProposals: Proposal[];
  myProposals: Proposal[];
  selectedProposal: Proposal | null;
  proposalStatus: ProposalStatusResponse | null;
  requiredDocuments: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ProposalState = {
  allProposals: [],
  myProposals: [],
  selectedProposal: null,
  proposalStatus: null,
  requiredDocuments: [],
  loading: false,
  error: null
}

// Async thunks
export const submitProposal = createAsyncThunk(
  'proposal/submit',
  async ({ userId, proposalData }: { userId: string; proposalData: ProposalCreateDto }) => {
    return await proposalApi.submitProposal(userId, proposalData);
  }
);

export const fetchAllProposals = createAsyncThunk(
  'proposal/fetchAll',
  async () => {
    return await proposalApi.getAllProposals();
  }
);

export const fetchMyProposals = createAsyncThunk(
  'proposal/fetchMy',
  async (userId: string) => {
    return await proposalApi.getMyProposals(userId);
  }
);

export const fetchProposalById = createAsyncThunk(
  'proposal/fetchById',
  async (proposalId: string) => {
    return await proposalApi.getProposalById(proposalId);
  }
);

export const fetchProposalStatus = createAsyncThunk(
  'proposal/fetchStatus',
  async (proposalId: string) => {
    return await proposalApi.getProposalStatus(proposalId);
  }
);

export const fetchRequiredDocuments = createAsyncThunk(
  'proposal/fetchRequiredDocs',
  async (proposalId: string) => {
    return await proposalApi.getRequiredDocuments(proposalId);
  }
);

export const updateProposalStatus = createAsyncThunk(
  'proposal/updateStatus',
  async ({ proposalId, status, notes }: { proposalId: string; status: Status; notes?: string }) => {
    await proposalApi.updateProposalStatus(proposalId, status.toString(), notes);
    return { proposalId, status, notes };
  }
);

export const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    setSelectedProposal: (state, action: PayloadAction<Proposal>) => {
      state.selectedProposal = action.payload;
    },
    clearSelectedProposal: (state) => {
      state.selectedProposal = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.loading = false;
        const dto = action.payload;
        const convertedProposal: Proposal = {
          proposalId: dto.proposalId,
          userId: dto.userId,
          productId: dto.productId,
          sumAssured: dto.sumAssured,
          termYears: dto.termYears,
          premiumAmount: dto.premiumAmount,
          premiumFrequency: dto.premiumFrequency as PremiumFrequency,
          height: dto.height,
          weight: dto.weight,
          isSmoker: dto.isSmoker,
          isDrinker: dto.isDrinker,
          preExistingConditions: dto.preExistingConditions,
          occupation: dto.occupation,
          annualIncome: dto.annualIncome,
          status: dto.status as unknown as Status,
          appliedDate: dto.appliedDate,
          reviewedDate: dto.reviewedDate
        };
        state.myProposals.push(convertedProposal);
        state.selectedProposal = convertedProposal;
      })
      .addCase(submitProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit proposal';
      })
      .addCase(fetchAllProposals.fulfilled, (state, action) => {
        state.allProposals = action.payload.map((dto: ProposalDto): Proposal => ({
          proposalId: dto.proposalId,
          userId: dto.userId,
          productId: dto.productId,
          sumAssured: dto.sumAssured,
          termYears: dto.termYears,
          premiumAmount: dto.premiumAmount,
          premiumFrequency: dto.premiumFrequency as PremiumFrequency,
          height: dto.height,
          weight: dto.weight,
          isSmoker: dto.isSmoker,
          isDrinker: dto.isDrinker,
          preExistingConditions: dto.preExistingConditions,
          occupation: dto.occupation,
          annualIncome: dto.annualIncome,
          status: dto.status as unknown as Status,
          appliedDate: dto.appliedDate,
          reviewedDate: dto.reviewedDate
        }));
      })
      .addCase(fetchMyProposals.fulfilled, (state, action) => {
        state.myProposals = action.payload.map((dto: ProposalDto): Proposal => ({
          proposalId: dto.proposalId,
          userId: dto.userId,
          productId: dto.productId,
          sumAssured: dto.sumAssured,
          termYears: dto.termYears,
          premiumAmount: dto.premiumAmount,
          premiumFrequency: dto.premiumFrequency as PremiumFrequency,
          height: dto.height,
          weight: dto.weight,
          isSmoker: dto.isSmoker,
          isDrinker: dto.isDrinker,
          preExistingConditions: dto.preExistingConditions,
          occupation: dto.occupation,
          annualIncome: dto.annualIncome,
          status: dto.status as unknown as Status,
          appliedDate: dto.appliedDate,
          reviewedDate: dto.reviewedDate
        }));
      })
      .addCase(fetchProposalById.fulfilled, (state, action) => {
        const dto = action.payload;
        state.selectedProposal = {
          proposalId: dto.proposalId,
          userId: dto.userId,
          productId: dto.productId,
          sumAssured: dto.sumAssured,
          termYears: dto.termYears,
          premiumAmount: dto.premiumAmount,
          premiumFrequency: dto.premiumFrequency as PremiumFrequency,
          height: dto.height,
          weight: dto.weight,
          isSmoker: dto.isSmoker,
          isDrinker: dto.isDrinker,
          preExistingConditions: dto.preExistingConditions,
          occupation: dto.occupation,
          annualIncome: dto.annualIncome,
          status: dto.status as unknown as Status,
          appliedDate: dto.appliedDate,
          reviewedDate: dto.reviewedDate
        };
      })
      .addCase(fetchProposalStatus.fulfilled, (state, action) => {
        state.proposalStatus = {
          proposalId: action.payload.proposalId,
          status: action.payload.status as unknown as Status,
          underwritingNotes: action.payload.notes,
          appliedDate: action.payload.appliedDate,
          reviewedDate: action.payload.reviewedDate
        };
      })
      .addCase(fetchRequiredDocuments.fulfilled, (state, action) => {
        state.requiredDocuments = action.payload;
      })
      .addCase(updateProposalStatus.fulfilled, (state, action) => {
        const { proposalId, status } = action.payload;
        const proposal = state.allProposals.find((p) => p.proposalId === proposalId);
        if (proposal) {
          proposal.status = status;
        }
      });
  },
});

export const { 
  setSelectedProposal, 
  clearSelectedProposal, 
  clearError 
} = proposalSlice.actions;
export default proposalSlice.reducer;
