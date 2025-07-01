import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null; 
  user: {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[]; 
    permissions: string[];
  } | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null, 
  user: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;  
      tokenExpiry?: number; 
    }>) => {
      const { accessToken, refreshToken, tokenExpiry } = action.payload;
      const decoded = jwtDecode<{
        email: string;
        firstName: string;
        lastName: string;
        roles: string;
        permissions: string[];
        exp: number;
      }>(accessToken);

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiry = tokenExpiry ?? decoded.exp * 1000;
      state.user = {
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        roles: decoded.roles.split(','),
        permissions: decoded.permissions
      };
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.user = null;
    }
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;