import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { paymentApi, type PaymentHistory, type DuePremium, type PaymentReceipt } from "../api/payment.api";


type PaymentState = {
  paymentHistory: PaymentHistory[];
  duePremiums: DuePremium[];
  selectedPayment: PaymentHistory | null;
  paymentReceipt: PaymentReceipt | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentHistory: [],
  duePremiums: [],
  selectedPayment: null,
  paymentReceipt: null,
  loading: false,
  error: null
}

// Async thunks
export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (userId: string) => {
    return await paymentApi.getPaymentHistory(userId);
  }
);

export const fetchDuePremiums = createAsyncThunk(
  'payment/fetchDuePremiums',
  async (userId: string) => {
    return await paymentApi.getDuePremiums(userId);
  }
);

export const payPremium = createAsyncThunk(
  'payment/payPremium',
  async ({ policyId, userId, paymentMethod }: { policyId: string; userId: string; paymentMethod: string }) => {
    return await paymentApi.payPremium(policyId, userId, paymentMethod);
  }
);

export const fetchPaymentReceipt = createAsyncThunk(
  'payment/fetchReceipt',
  async (transactionId: string) => {
    return await paymentApi.getPaymentReceipt(transactionId);
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payment/fetchById',
  async (paymentId: string) => {
    return await paymentApi.getPaymentById(paymentId);
  }
);

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSelectedPayment: (state, action: PayloadAction<PaymentHistory>) => {
      state.selectedPayment = action.payload;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    clearPaymentReceipt: (state) => {
      state.paymentReceipt = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment history';
      })

      .addCase(fetchDuePremiums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDuePremiums.fulfilled, (state, action) => {
        state.loading = false;
        state.duePremiums = action.payload;
      })

      .addCase(payPremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payPremium.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.paymentHistory.unshift(action.payload);

        const successStatusNames = ['Success', 'Completed', 'Paid', 'Active'];
        if (successStatusNames.includes(action.payload.status)) {
          state.duePremiums = state.duePremiums.filter(
            premium => premium.policyId !== action.payload.policyId
          );
        }
      })
      .addCase(payPremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process payment';
      })

      .addCase(fetchPaymentReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentReceipt = action.payload;
      })
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayment = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message || 'Payment operation failed';
        }
      );
  },
});

export const { 
  setSelectedPayment, 
  clearSelectedPayment, 
  clearPaymentReceipt,
  clearError 
} = paymentSlice.actions;
export default paymentSlice.reducer;

export { fetchPaymentHistory as fetchMyPayments };
export { fetchDuePremiums as getMyPayments };