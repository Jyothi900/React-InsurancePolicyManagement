import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi, type DashboardData } from '../api/dashboard.api';

interface DashboardState {
  customerData: DashboardData | null;
  adminData: any | null;
  agentData: any | null;
  underwriterData: any | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  underwriterCache: {
    [userId: string]: {
      data: any;
      timestamp: number;
    }
  };
}

const initialState: DashboardState = {
  customerData: null,
  adminData: null,
  agentData: null,
  underwriterData: null,
  loading: false,
  error: null,
  lastFetched: null,
  underwriterCache: {}
};

// Customer dashboard
export const fetchCustomerDashboard = createAsyncThunk(
  'dashboard/fetchCustomer',
  async (userId: string) => {
    return await dashboardApi.getDashboardData(userId);
  }
);

// Admin dashboard
export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdmin',
  async () => {
    const result = await dashboardApi.getAdminDashboard();
    return result;
  }
);

// Agent dashboard
export const fetchAgentDashboard = createAsyncThunk(
  'dashboard/fetchAgent',
  async (agentId: string) => {
    const result = await dashboardApi.getAgentDashboard(agentId);
    return result;
  }
);

// Underwriter dashboard with caching
export const fetchUnderwriterDashboard = createAsyncThunk(
  'dashboard/fetchUnderwriter',
  async (underwriterId: string, { getState, rejectWithValue }) => {
    const state = getState() as { dashboard: DashboardState };
    const cache = state.dashboard.underwriterCache[underwriterId];
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    // Check if we have cached data that's still valid
    if (cache && (Date.now() - cache.timestamp) < CACHE_DURATION) {
      console.log('Using cached underwriter data');
      return { data: cache.data, underwriterId, fromCache: true };
    }
    
    try {
      console.log('Fetching fresh underwriter data from API');
      const result = await dashboardApi.getUnderwriterDashboard(underwriterId);
      return { data: result, underwriterId, fromCache: false };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch underwriter dashboard');
    }
  }
);

// Force refresh underwriter dashboard (bypasses cache)
export const forceRefreshUnderwriterDashboard = createAsyncThunk(
  'dashboard/forceRefreshUnderwriter',
  async (underwriterId: string) => {
    const result = await dashboardApi.getUnderwriterDashboard(underwriterId);
    return { data: result, underwriterId };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.customerData = null;
      state.adminData = null;
      state.agentData = null;
      state.underwriterData = null;
      state.error = null;
      state.lastFetched = null;
      state.underwriterCache = {};
    },
    clearUnderwriterCache: (state, action) => {
      if (action.payload) {
        delete state.underwriterCache[action.payload];
      } else {
        state.underwriterCache = {};
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Customer Dashboard
      .addCase(fetchCustomerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.customerData = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCustomerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer dashboard';
      })
      // Admin Dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin dashboard';
      })
      // Agent Dashboard
      .addCase(fetchAgentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.agentData = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAgentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agent dashboard';
      })
      // Underwriter Dashboard
      .addCase(fetchUnderwriterDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnderwriterDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const { data, underwriterId, fromCache } = action.payload;
        
        // Always update the current data
        state.underwriterData = data;
        
        // If it's fresh data (not from cache), update the cache
        if (!fromCache) {
          state.underwriterCache[underwriterId] = {
            data,
            timestamp: Date.now()
          };
        }
        
        state.lastFetched = Date.now();
        console.log('Underwriter data updated in Redux:', data);
      })
      .addCase(fetchUnderwriterDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch underwriter dashboard';
      })
      // Force Refresh Underwriter Dashboard
      .addCase(forceRefreshUnderwriterDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceRefreshUnderwriterDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const { data, underwriterId } = action.payload;
        
        // Update cache with fresh data
        state.underwriterCache[underwriterId] = {
          data,
          timestamp: Date.now()
        };
        state.underwriterData = data;
        state.lastFetched = Date.now();
      })
      .addCase(forceRefreshUnderwriterDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to refresh underwriter dashboard';
      });
  }
});

export const { clearDashboard, clearUnderwriterCache } = dashboardSlice.actions;
export default dashboardSlice.reducer;