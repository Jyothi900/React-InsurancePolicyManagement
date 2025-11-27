import httpClient from './http';

export interface EnumValue {
  value: number;
  name: string;
}

interface AllEnumsResponse {
  userRoles: EnumValue[];
  genders: EnumValue[];
  kycStatuses: EnumValue[];
  statuses: EnumValue[];
  policyTypes: EnumValue[];
  insuranceTypes: EnumValue[];
  documentTypes: EnumValue[];
  paymentMethods: EnumValue[];
  premiumFrequencies: EnumValue[];
}

export const enumApi = {
  getAllEnums: async (): Promise<AllEnumsResponse> => {
    const { data } = await httpClient.get<AllEnumsResponse>('/api/enum/all-enums');
    return data;
  },

  getUserRoles: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/user-roles');
    return data;
  },

  getGenders: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/genders');
    return data;
  },

  getKYCStatuses: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/kyc-statuses');
    return data;
  },

  getStatuses: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/statuses');
    return data;
  },

  getPolicyTypes: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/policy-types');
    return data;
  },

  getInsuranceTypes: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/insurance-types');
    return data;
  },

  getDocumentTypes: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/document-types');
    return data;
  },

  getPaymentMethods: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/payment-methods');
    return data;
  },

  getPremiumFrequencies: async (): Promise<EnumValue[]> => {
    const { data } = await httpClient.get<EnumValue[]>('/api/enum/premium-frequencies');
    return data;
  },

};