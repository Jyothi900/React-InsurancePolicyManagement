import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { userApi } from "../api/user.api";
import type { User, UserRegistrationRequest, UserUpdateRequest, UserRole, Gender, KYCStatus } from "../types/User";
import type { User as ApiUser, UserRegistration, UserUpdate } from "../api/user.api";

type UserState = {
  currentUser: User | null;
  users: User[];
  agents: User[];
  underwriters: User[];
  unassignedCustomers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  agents: [],
  underwriters: [],
  unassignedCustomers: [],
  loading: false,
  error: null
}

// Async thunks
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: UserRegistrationRequest) => {
    const apiRequest: UserRegistration = {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      mobile: userData.mobile,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      role: userData.role
    };
    return await userApi.createUser(apiRequest);
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId: string) => {
    return await userApi.getUserById(userId);
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, updates }: { userId: string; updates: UserUpdateRequest }) => {
    const apiUpdate: UserUpdate = {
      fullName: updates.fullName,
      email: updates.email,
      role: updates.role,
      mobile: updates.mobile,
      dateOfBirth: updates.dateOfBirth,
      gender: updates.gender,
      aadhaarNumber: updates.aadhaarNumber,
      panNumber: updates.panNumber,
      address: updates.address,
      kycStatus: updates.kycStatus
    };
    return await userApi.updateUser(userId, apiUpdate);
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async ({ userId, imageFile }: { userId: string; imageFile: File }, { rejectWithValue }) => {
    try {
      const result = await userApi.uploadProfileImage(userId, imageFile);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Upload failed');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAll',
  async () => {
    return await userApi.getAllUsers();
  }
);

export const fetchAgents = createAsyncThunk(
  'user/fetchAgents',
  async (location?: string) => {
    return await userApi.getAgents(location);
  }
);

export const fetchUnderwriters = createAsyncThunk(
  'user/fetchUnderwriters',
  async () => {
    return await userApi.getUnderwriters();
  }
);

export const assignAgent = createAsyncThunk(
  'user/assignAgent',
  async ({ customerId, agentId, underwriterId }: { customerId: string; agentId: string; underwriterId?: string }) => {
    return await userApi.assignAgent(customerId, agentId, underwriterId);
  }
);

export const fetchAllUserManagementData = createAsyncThunk(
  'user/fetchAllManagementData',
  async () => {
    console.log('Fetching all user management data in single call...');
    return await userApi.getAllUserManagementData();
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const convertedUser: User = {
          ...action.payload,
          role: action.payload.role as UserRole,
          gender: action.payload.gender as Gender,
          kycStatus: action.payload.kycStatus as KYCStatus
        };
        state.currentUser = convertedUser;
        state.users.push(convertedUser);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        const convertedUser: User = {
          ...action.payload,
          role: action.payload.role as UserRole,
          gender: action.payload.gender as Gender,
          kycStatus: action.payload.kycStatus as KYCStatus
        };
        state.currentUser = convertedUser;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const convertedUser: User = {
          ...action.payload,
          role: action.payload.role as UserRole,
          gender: action.payload.gender as Gender,
          kycStatus: action.payload.kycStatus as KYCStatus
        };
        state.currentUser = convertedUser;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agents = action.payload.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
      })
      .addCase(fetchUnderwriters.fulfilled, (state, action) => {
        state.underwriters = action.payload.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
      })
      .addCase(assignAgent.fulfilled, (state, action) => {
        const userIndex = state.users.findIndex(u => u.userId === action.payload.customerId);
        if (userIndex !== -1) {
          state.users[userIndex].assignedAgentId = action.payload.agentId;
        }
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.profileImagePath = action.payload.profileImagePath;
        }
      })

      .addCase(fetchAllUserManagementData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserManagementData.fulfilled, (state, action) => {
        state.loading = false;
        const { users, agents, underwriters, unassignedCustomers } = action.payload;
        
        state.users = users.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
        
        state.agents = agents.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
        
        state.underwriters = underwriters.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
        
        state.unassignedCustomers = unassignedCustomers.map((apiUser: ApiUser): User => ({
          ...apiUser,
          role: apiUser.role as UserRole,
          gender: apiUser.gender as Gender,
          kycStatus: apiUser.kycStatus as KYCStatus
        }));
      })
      .addCase(fetchAllUserManagementData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user management data';
      });
  },
});

export const updateUser = updateUserProfile;
export const fetchUsers = fetchAllUsers;

export const { setCurrentUser, clearCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer;
