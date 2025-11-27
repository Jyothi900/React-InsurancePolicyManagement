import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";
import { tokenstore } from "../auth/tokenstore";
import { decodeJWT, isTokenExpired } from "../auth/jwtUtils";
import type { LoginRequest } from "../types/User";
import { UserRoleNames } from "../types/Common";

type AuthState = {
  isAuthenticated:boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  email:string | null;
  role:string |null;
}

const initializeAuthState = (): AuthState => {
  const token = tokenstore.get();
  
  if (token && !isTokenExpired(token)) {
    const payload = decodeJWT(token);
    if (payload) {
      let roleNumber: number;
      if (typeof payload.Role === 'string' && isNaN(parseInt(payload.Role))) {
        const roleStringMap: Record<string, number> = {
          'Customer': 0,
          'Agent': 1,
          'Admin': 2,
          'Underwriter': 3
        };
        roleNumber = roleStringMap[payload.Role] ?? 0;
      } else {
        roleNumber = parseInt(payload.Role);
      }
      const roleName = UserRoleNames[roleNumber as keyof typeof UserRoleNames] || 'Customer';
      return {
        isAuthenticated: true,
        user: {
          id: payload.Id,
          email: payload.Email,
          role: roleName
        },
        email: payload.Email,
        role: roleName
      };
    }
  }
  
  tokenstore.clear();
  
  return {
    isAuthenticated: false,
    user: null,
    email: null,
    role: null
  };
};

const initialState: AuthState = initializeAuthState();

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials); 
      if (!response.token) {
        throw new Error('No token received from server');
      }

      tokenstore.set(response.token);
      const roleName = UserRoleNames[response.role as keyof typeof UserRoleNames] || 'Customer';
      tokenstore.setRole(roleName);
      
      return { 
        id: response.id, 
        email: response.email, 
        role: roleName 
      };
    } catch (error: any) {
      
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const authSlice = createSlice({
  name:'auth',
  initialState,
  reducers:{
    login:(s,a:PayloadAction<{id:string,email:string,role:string}>)=>{
      s.isAuthenticated=true;
      s.user = a.payload;
      s.email=a.payload.email;
      s.role=a.payload.role;
    },
    logout:(s)=>{
      s.isAuthenticated=false;
      s.user = null;
      s.email=null;
      s.role=null;
      tokenstore.clear();
    },
    restoreAuth:(s)=>{
      const token = tokenstore.get();
      console.log('RestoreAuth - Token exists:', !!token);
      
      if (token && !isTokenExpired(token)) {
        const payload = decodeJWT(token);
        console.log('JWT Payload:', payload);
        if (payload) {
          let roleNumber: number;
          if (typeof payload.Role === 'string' && isNaN(parseInt(payload.Role))) {
            const roleStringMap: Record<string, number> = {
              'Customer': 0,
              'Agent': 1,
              'Admin': 2,
              'Underwriter': 3
            };
            roleNumber = roleStringMap[payload.Role] ?? 0;
          } else {
            roleNumber = parseInt(payload.Role);
          }
          const roleName = UserRoleNames[roleNumber as keyof typeof UserRoleNames] || 'Customer';
          console.log('Role mapping:', roleNumber, '->', roleName);
          s.isAuthenticated = true;
          s.user = {
            id: payload.Id,
            email: payload.Email,
            role: roleName
          };
          s.email = payload.Email;
          s.role = roleName;
          console.log('Auth restored - Role:', roleName);
        }
      } else {
        console.log('Token invalid/expired - clearing auth');
        tokenstore.clear();
        s.isAuthenticated = false;
        s.user = null;
        s.email = null;
        s.role = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.email = action.payload.email;
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.email = null;
        state.role = null;
      });
  },
});

export { registerUser as register } from './userSlice';

export const {login, logout, restoreAuth} = authSlice.actions;
export default authSlice.reducer;
