import httpClient from './http';
import type { Payment, DuePremiumResponse, PaymentReceiptResponse } from '../types/Payment';


export type PaymentHistory = Payment;
export type DuePremium = DuePremiumResponse;
export type PaymentReceipt = PaymentReceiptResponse;

export const paymentApi = {
  getPaymentHistory: async (userId: string): Promise<PaymentHistory[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<PaymentHistory[]>('/api/payment/history', payload);
    return data;
  },

  getDuePremiums: async (userId: string): Promise<DuePremium[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<DuePremium[]>('/api/payment/due-premiums', payload);
    return data;
  },


  payPremium: async (policyId: string, userId: string, paymentMethod: string): Promise<PaymentHistory> => {
    const payload = {
      PolicyId: policyId,
      UserId: userId,
      PaymentMethod: paymentMethod
    };
    const { data } = await httpClient.post<PaymentHistory>('/api/payment/pay-premium', payload);
    return data;
  },


  getPaymentReceipt: async (transactionId: string): Promise<PaymentReceipt> => {
    const payload = { transactionId };
    const { data } = await httpClient.post<PaymentReceipt>('/api/payment/receipt', payload);
    return data;
  },


  getPaymentById: async (paymentId: string): Promise<PaymentHistory> => {
    const payload = { paymentId };
    const { data } = await httpClient.post<PaymentHistory>('/api/payment/by-id', payload);
    return data;
  },

  payProposal: async (proposalId: string, userId: string, paymentMethod: string): Promise<PaymentHistory> => {
    const payload = {
      ProposalId: proposalId,
      UserId: userId,
      PaymentMethod: paymentMethod
    };
    const { data } = await httpClient.post<PaymentHistory>('/api/payment/pay-proposal', payload);
    return data;
  },

  getPendingPayments: async (userId: string): Promise<any[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<any[]>('/api/payment/pending-payments', payload);
    return data;
  },


  getIssuedProposals: async (userId: string): Promise<any[]> => {
    const payload = { userId };
    const { data } = await httpClient.post<any[]>('/api/payment/issued-proposals', payload);
    return data;
  }
};