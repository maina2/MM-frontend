import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Product, Order, Payment, Delivery } from '../types';

// Define the base URL for the backend
const BASE_URL = 'http://localhost:8000/api/';

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Register a new user
    register: builder.mutation<User, { username: string; email: string; password: string }>({
      query: (credentials) => ({
        url: 'users/register/',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Login and get JWT token
    login: builder.mutation<{ access: string }, { username: string; password: string }>({
      query: (credentials) => ({
        url: 'users/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Fetch all products
    getProducts: builder.query<Product[], void>({
      query: () => 'products/products/',
    }),

    // Create an order
    createOrder: builder.mutation<Order, { items: { product_id: number; quantity: number }[] }>({
      query: (orderData) => ({
        url: 'orders/',
        method: 'POST',
        body: orderData,
      }),
    }),

    // Initiate a payment
    initiatePayment: builder.mutation<Payment, { order_id: number; phone_number: string }>({
      query: (paymentData) => ({
        url: 'payments/',
        method: 'POST',
        body: paymentData,
      }),
    }),

    // Create a delivery
    createDelivery: builder.mutation<
      Delivery,
      { order_id: number; delivery_address: string; latitude?: number; longitude?: number }
    >({
      query: (deliveryData) => ({
        url: 'deliveries/',
        method: 'POST',
        body: deliveryData,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProductsQuery,
  useCreateOrderMutation,
  useInitiatePaymentMutation,
  useCreateDeliveryMutation,
} = apiSlice;