import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../store/authSlice';
import { User, Product, Order, Payment, Delivery } from '../types';
import { RootState } from '../store/store';

const BASE_URL = 'http://localhost:8000/api/';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<User, { username: string; email: string; password: string }>({
      query: (credentials) => ({
        url: 'users/register/',  // Now /api/users/register/
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<
      { user: User; access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: 'users/login/',  // Now /api/users/login/
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
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
      query: () => 'products/products/',  // Now /api/products/products/
    }),
    createOrder: builder.mutation<Order, { items: { product_id: number; quantity: number }[] }>({
      query: (orderData) => ({
        url: 'orders/',  // Now /api/orders/
        method: 'POST',
        body: orderData,
      }),
    }),
    initiatePayment: builder.mutation<Payment, { order_id: number; phone_number: string }>({
      query: (paymentData) => ({
        url: 'payment/',  // Now /api/payment/
        method: 'POST',
        body: paymentData,
      }),
    }),
    createDelivery: builder.mutation<
      Delivery,
      { order_id: number; delivery_address: string; latitude?: number; longitude?: number }
    >({
      query: (deliveryData) => ({
        url: 'delivery/',  // Now /api/delivery/
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