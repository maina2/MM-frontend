import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../store/authSlice';
import { User, Product, Order, Payment, Delivery } from '../types';

const BASE_URL = 'http://localhost:8000/api/';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<User, { username: string; email: string; password: string }>({
      query: (credentials) => ({
        url: 'users/register/',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<
      { user: User; access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: 'users/login/',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Add is_delivery_person since the backend doesn't return it
          const userWithDefaults: User = {
            ...data.user,
            is_delivery_person: data.user.is_delivery_person ?? false,
          };
          dispatch(setCredentials({ user: userWithDefaults, token: data.access }));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    getProducts: builder.query<Product[], void>({
      query: () => 'products/products/',
    }),
    createOrder: builder.mutation<Order, { items: { product_id: number; quantity: number }[] }>({
      query: (orderData) => ({
        url: 'orders/',
        method: 'POST',
        body: orderData,
      }),
    }),
    initiatePayment: builder.mutation<Payment, { order_id: number; phone_number: string }>({
      query: (paymentData) => ({
        url: 'payments/',
        method: 'POST',
        body: paymentData,
      }),
    }),
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

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProductsQuery,
  useCreateOrderMutation,
  useInitiatePaymentMutation,
  useCreateDeliveryMutation,
} = apiSlice;