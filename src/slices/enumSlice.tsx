import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { enumApi, type EnumValue } from "../api/enum.api";
import { deduplicateApiCall } from "../utils/apiDeduplicator";

interface EnumState {
  userRoles: EnumValue[];
  genders: EnumValue[];
  kycStatuses: EnumValue[];
  statuses: EnumValue[];
  policyTypes: EnumValue[];
  insuranceTypes: EnumValue[];
  documentTypes: EnumValue[];
  paymentMethods: EnumValue[];
  premiumFrequencies: EnumValue[];

  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: EnumState = {
  userRoles: [],
  genders: [],
  kycStatuses: [],
  statuses: [],
  policyTypes: [],
  insuranceTypes: [],
  documentTypes: [],
  paymentMethods: [],
  premiumFrequencies: [],

  loading: false,
  error: null,
  lastFetched: null
};

let isEnumFetching = false;

export const fetchAllEnums = createAsyncThunk('enum/fetchAll', async (_, { getState, rejectWithValue }) => {
  const state = getState() as { enum: EnumState };
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (state.enum.lastFetched && (now - state.enum.lastFetched) < fiveMinutes) {
    return rejectWithValue('Data already cached');
  }
  

  if (isEnumFetching) {
    return rejectWithValue('Fetch already in progress');
  }
  
  isEnumFetching = true;
  const allEnums = await deduplicateApiCall('allEnums', () => enumApi.getAllEnums());
  const { userRoles, genders, kycStatuses, statuses, policyTypes, insuranceTypes, documentTypes, paymentMethods, premiumFrequencies } = allEnums;
  
  isEnumFetching = false;
  return { userRoles, genders, kycStatuses, statuses, policyTypes, insuranceTypes, documentTypes, paymentMethods, premiumFrequencies };
});

const enumSlice = createSlice({
  name: 'enum',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEnums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEnums.fulfilled, (state, action) => {
        state.loading = false;
        state.userRoles = action.payload.userRoles;
        state.genders = action.payload.genders;
        state.kycStatuses = action.payload.kycStatuses;
        state.statuses = action.payload.statuses;
        state.policyTypes = action.payload.policyTypes;
        state.insuranceTypes = action.payload.insuranceTypes;
        state.documentTypes = action.payload.documentTypes;
        state.paymentMethods = action.payload.paymentMethods;
        state.premiumFrequencies = action.payload.premiumFrequencies;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllEnums.rejected, (state, action) => {
        state.loading = false;
        if (action.payload !== 'Data already cached' && action.payload !== 'Fetch already in progress') {
          state.error = action.error.message || 'Failed to fetch enums';
        }
      });
  }
});

export const { clearError } = enumSlice.actions;
export default enumSlice.reducer;