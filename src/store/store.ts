import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '../api/apiSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

// Error logging middleware to catch and log Redux errors
const errorLoggingMiddleware = () => (next: any) => (action: any) => {
  if (action?.error) {
    console.error('Redux Error:', action.error);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(errorLoggingMiddleware),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

setupListeners(store.dispatch);

// Define types for the Redux store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;