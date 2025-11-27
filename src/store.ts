import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./slices/authslice";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import proposalReducer from "./slices/proposalSlice";
import policyReducer from "./slices/policySlice";
import claimReducer from "./slices/claimSlice";
import paymentReducer from "./slices/paymentSlice";
import documentReducer from "./slices/documentSlice";
import enumReducer from "./slices/enumSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    proposal: proposalReducer,
    policy: policyReducer,
    claim: claimReducer,
    payment: paymentReducer,
    document: documentReducer,
    enum: enumReducer,
    dashboard: dashboardReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
