import httpClient from './http';
import type{
  PolicyProduct,
  QuoteRequest,
  QuoteResponse,
  ProductCreateRequest,
  EligibilityResponse
} from '../types/Product';

let insuranceTypesCache: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 60 * 1000; 

export const productApi = {

  getAllProducts: async (): Promise<PolicyProduct[]> => {
    const { data } = await httpClient.get<PolicyProduct[]>('/api/PolicyProduct');
    return data;
  },

  getProductById: async (productId: string): Promise<PolicyProduct> => {
    const payload = { productId };
    const { data } = await httpClient.post<PolicyProduct>('/api/PolicyProduct/by-id', payload);
    return data;
  },

  getProductsByType: async (insuranceType: string): Promise<PolicyProduct[]> => {
    const payload = { insuranceType };
    const { data } = await httpClient.post<PolicyProduct[]>('/api/PolicyProduct/by-type', payload);
    return data;
  },

  getInsuranceTypes: async (): Promise<string[]> => {
    const now = Date.now();
    if (insuranceTypesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return insuranceTypesCache;
    }
    
    const { data } = await httpClient.get<string[]>('/api/PolicyProduct/insurancetypes');
    insuranceTypesCache = data;
    cacheTimestamp = now;
    return data;
  },

  calculatePremium: async (quoteRequest: QuoteRequest): Promise<QuoteResponse> => {
    try {
      const { data } = await httpClient.post<QuoteResponse>('/api/PolicyProduct/calculate-premium', quoteRequest);
      return data;
    } catch (error: any) {

      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (typeof errorData === 'string') {
          error.userMessage = errorData;
        } else if (errorData?.errors) {
          error.userMessage = Object.values(errorData.errors).flat().join(', ');
        } else {
          error.userMessage = 'Invalid input data. Please check your values and try again.';
        }
      }
      
      throw error;
    }
  },


  checkEligibility: async (productId: string, age: number): Promise<EligibilityResponse> => {
    try {
      const payload = { productId, age };
      const { data } = await httpClient.post<EligibilityResponse>('/api/PolicyProduct/eligibility-check', payload);
      return data;
    } catch (error) {
      return {
        eligible: true,
        productId,
        age
      };
    }
  },


  createProduct: async (productData: ProductCreateRequest): Promise<PolicyProduct> => {
    try {
      console.log('API: Creating product:', productData);
      const { data } = await httpClient.post<PolicyProduct>('/api/PolicyProduct', productData);
      console.log('API: Create response:', data);
      return data;
    } catch (error: any) {
      console.error('API: Create failed:', error.response?.data);
      throw error;
    }
  },


  updateProduct: async (productId: string, updates: Partial<ProductCreateRequest>): Promise<PolicyProduct> => {
    try {
      console.log('API: Updating product:', productId, updates);
      const payload = { productId, ...updates };
      const { data } = await httpClient.patch<PolicyProduct>('/api/PolicyProduct/update', payload);
      console.log('API: Update response:', data);
      return data;
    } catch (error: any) {
      console.error('API: Update failed:', error.response?.data);
      throw error;
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    const payload = { productId };
    await httpClient.delete('/api/PolicyProduct/delete', { data: payload });
  },

  getProductsPageData: async (): Promise<{
    products: PolicyProduct[];
    insuranceTypes: string[];
    enums: any;
  }> => {
    const { data } = await httpClient.get('/api/PolicyProduct/products-page-data');
    return data;
  },

  getCustomerJourneyData: async (request: {
    userId?: string;
    productId?: string;
    quoteRequest?: QuoteRequest;
  }): Promise<any> => {
    const payload = {
      UserId: request.userId,
      ProductId: request.productId,
      QuoteRequest: request.quoteRequest
    };
    const { data } = await httpClient.post('/api/CustomerJourney/customer-data', payload);
    return data;
  },

  calculatePremiumWithContext: async (request: {
    userId?: string;
    quoteRequest: QuoteRequest;
  }): Promise<any> => {
    const payload = {
      UserId: request.userId,
      QuoteRequest: request.quoteRequest
    };
    const { data } = await httpClient.post('/api/CustomerJourney/calculate-premium', payload);
    return data;
  },
};
