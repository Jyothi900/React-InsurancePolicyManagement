import httpClient from './http';
import { type LoginRequest, type LoginResponse } from '../types/User';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const endpoints = ['/api/Token/login', '/api/auth/login', '/api/Account/login'];
    
    for (const endpoint of endpoints) {
      try {
        
        const { data } = await httpClient.post<LoginResponse>(endpoint, credentials);
      
        return data;
      } catch (error: any) {
        console.error(`Login failed for ${endpoint}:`, error.response?.data);
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw error; 
        }
      }
    }
    throw new Error('All login endpoints failed');
  },
  
  sendOtp: async (email: string) => {
    const { data } = await httpClient.post('/api/otp/send', { email });
    return data;
  },
  
  verifyOtp: async (email: string, otp: string) => {
    const { data } = await httpClient.post('/api/otp/verify', { email, otp });
    return data;
  },
  
  resendOtp: async (email: string) => {
    const { data } = await httpClient.post('/api/otp/resend', { email });
    return data;
  },
};


export const getToken = authApi.login;
