
import type { PaymentMethod, PaymentStatus } from './Common';


export interface Payment {
  paymentId: string;
  policyId: string;
  userId: string;
  amount: number;
  paymentType: string; 
  paymentMethod: string; 
  transactionId?: string;
  paymentGateway?: string;
  status: string; 
  paymentDate: string; 
  processedDate?: string; 
  failureReason?: string;
  dueDate?: string; 
  nextDueDate?: string; 
}


export type PaymentResponse = Payment;

export interface DuePremiumResponse {
  policyId: string;
  policyNumber: string;
  premiumAmount: number;
  dueDate: string;
  overdueDays: number;
  penaltyAmount: number;
  totalAmount: number;
}

export interface PaymentReceiptResponse {
  paymentId: string;
  transactionId: string;
  policyNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerName: string;
  customerEmail: string;
}
