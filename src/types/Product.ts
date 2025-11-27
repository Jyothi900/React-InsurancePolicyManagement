
export type PolicyType = 0 | 1 | 2 | 3 | 4 | 5 | 6; // TermLife=0, Endowment=1, ULIP=2, MoneyBack=3, Pension=4, ChildPlan=5, PersonalAccident=6
export type InsuranceType = 0 | 1 | 2; // Life=0, Motor=1, Property=2
export type RiskLevel = 0 | 1 | 2; // Low=0, Medium=1, High=2
export type PremiumFrequency = 0 | 1 | 2 | 3; // Annual=0, SemiAnnual=1, Quarterly=2, Monthly=3
export type Gender = 0 | 1 | 2; // Male=0, Female=1, Other=2

export type PolicyProduct = {
  productId: string;
  productName: string;
  description: string;
  policyType: PolicyType;
  minSumAssured: number;
  maxSumAssured: number;
  minAge: number;
  maxAge: number;
  policyTerm: number; 
  premiumRate: number; 
  isActive: boolean;
  createdAt: string;
  category: string;
  insuranceType: InsuranceType;
  riskLevel: RiskLevel;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  companyName: string;
  hasMaturityBenefit: boolean;
  hasDeathBenefit: boolean;
};

export type ProductCreateRequest = {
  productName: string;
  description: string;
  policyType: PolicyType;
  minSumAssured: number;
  maxSumAssured: number;
  minAge: number;
  maxAge: number;
  policyTerm: number;
  premiumRate: number;
  category: string;
  insuranceType: InsuranceType;
  riskLevel: RiskLevel;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  companyName: string;
  hasMaturityBenefit: boolean;
  hasDeathBenefit: boolean;
};

export type QuoteRequest = {
  productId: string;
  sumAssured: number;
  age: number;
  premiumFrequency: PremiumFrequency;
  termYears: number;
  isSmoker: boolean;
  gender: Gender;
};

export type QuoteResponse = {
  productId: string;
  productName: string;
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  validUntil: string;
  termYears?: number;
  totalPremium?: number;
  maturityAmount?: number;
};

export type EligibilityResponse = {
  eligible: boolean;
  productId: string;
  age: number;
};

export type Product = PolicyProduct;