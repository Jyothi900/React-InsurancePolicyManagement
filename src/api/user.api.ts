import httpClient from './http';

export interface UserRegistration {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  role: number;
}

export interface UserUpdate {
  fullName: string;
  email: string;
  role: number;
  mobile: string;
  dateOfBirth: string;
  gender: number;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  kycStatus: number;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  profileImagePath?: string;
  dateOfBirth: string;
  gender: number;
  aadhaarNumber?: string;
  panNumber?: string;
  address: string;
  role: number;
  isActive: boolean;
  kycStatus: number;
  createdAt: string;
  assignedAgentId?: string;
  agentAssignedDate?: string;
  assignedUnderwriterId?: string;
  underwriterAssignedDate?: string;
}

export interface AgentAssignment {
  agentId: string;
  underwriterId: string;
}

export interface CustomerAssignment {
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId?: string;
  agentName?: string;
  underwriterId?: string;
  underwriterName?: string;
  assignedDate: string;
}

export const userApi = {

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await httpClient.get<User[]>('/api/user');
    return data;
  },
  createUser: async (userData: UserRegistration): Promise<User> => {
    const { data } = await httpClient.post<User>('/api/user', userData);
    return data;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const payload = { email };
    const { data } = await httpClient.post<User>('/api/user/by-email', payload);
    return data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const payload = { userId };
    const { data } = await httpClient.post<User>('/api/user/by-id', payload);
    return data;
  },

  updateUser: async (userId: string, updates: UserUpdate): Promise<User> => {
    const payload = { userId, ...updates };
    const { data } = await httpClient.patch<User>('/api/user/update', payload);
    return data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const payload = { userId };
    const { data } = await httpClient.delete<{ message: string }>('/api/user/delete', { data: payload });
    return data;
  },

  getUnassignedCustomers: async (): Promise<User[]> => {
    const { data } = await httpClient.get<User[]>('/api/user/unassigned-customers');
    return data;
  },

  getAgents: async (location?: string): Promise<User[]> => {
    if (location) {
      const payload = { location };
      const { data } = await httpClient.post<User[]>('/api/user/agents-by-location', payload);
      return data;
    } else {
      const { data } = await httpClient.get<User[]>('/api/user/agents');
      return data;
    }
  },

  getUnderwriters: async (): Promise<User[]> => {
    const { data } = await httpClient.get<User[]>('/api/user/underwriters');
    return data;
  },

  assignAgent: async (customerId: string, agentId: string, underwriterId?: string): Promise<any> => {
    const payload = { customerId, agentId, underwriterId };
    const { data } = await httpClient.patch('/api/user/assign-agent', payload);
    return data;
  },

  getCustomerAssignments: async (): Promise<CustomerAssignment[]> => {
    const { data } = await httpClient.get<CustomerAssignment[]>('/api/user/customer-assignments');
    return data;
  },

  getAllUserManagementData: async (): Promise<{
    users: User[];
    agents: User[];
    underwriters: User[];
    unassignedCustomers: User[];
    customerAssignments: CustomerAssignment[];
  }> => {
    const { data } = await httpClient.get('/api/user/management-data');
    return data;
  },

  uploadProfileImage: async (userId: string, imageFile: File): Promise<{ profileImagePath: string }> => {
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('ProfileImage', imageFile);

    const { data } = await httpClient.post<{ profileImagePath: string }>('/api/user/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};