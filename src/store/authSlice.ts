// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: (() => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      // Validate user has a valid role
      const validRoles: Role[] = ['customer', 'admin', 'delivery'];
      if (user && (!user.role || !validRoles.includes(user.role))) {
        console.warn('Invalid user in localStorage, clearing', JSON.stringify(user, null, 2));
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
      console.log('Loaded user from localStorage:', JSON.stringify(user, null, 2));
      return user;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      console.log('setCredentials: Stored user in Redux and localStorage', JSON.stringify(action.payload.user, null, 2));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('Logged out, cleared localStorage');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export type Role = 'customer' | 'admin' | 'delivery';

// User type for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string | null;
  role: Role;
}