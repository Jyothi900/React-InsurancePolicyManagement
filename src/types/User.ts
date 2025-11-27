// User types - values fetched from API
export type UserRole = 0 | 1 | 2 | 3;
export type Gender = 0 | 1 | 2;
export type KYCStatus = 0 | 1 | 2;

// Main User type
export type User = {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  profileImagePath?: string;
  dateOfBirth: string;
  gender: Gender;
  aadhaarNumber?: string;
  panNumber?: string;
  address: string;
  role: UserRole;
  isActive: boolean;
  kycStatus: KYCStatus;
  createdAt: string;
  assignedAgentId?: string;
  agentAssignedDate?: string;
  assignedUnderwriterId?: string;
  underwriterAssignedDate?: string;
};

// Request types
export type UserRegistrationRequest = {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  role: UserRole;
};

export type UserUpdateRequest = {
  fullName: string;
  email: string;
  role: UserRole;
  mobile: string;
  dateOfBirth: string;
  gender: Gender;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  kycStatus: KYCStatus;
};

export type AgentAssignmentRequest = {
  agentId: string;
  underwriterId?: string;
};

// Response types
export type UserResponse = User;

export type AgentAssignmentResponse = {
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  agentContact: string;
  assignedDate: string;
  message: string;
};


export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  id: string;
  email: string;
  role: number;
};