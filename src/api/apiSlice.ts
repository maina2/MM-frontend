// src/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../store/authSlice';
import {
  User,
  Product,
  ProductDetail,
  Order,
  Payment,
  Delivery,
  Category,
} from '../types';
import { RootState } from '../store/store';

const BASE_URL = 'http://localhost:8000/api/';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: 'users/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        const newAccessToken = (refreshResult.data as any).access;
        const newRefreshToken =
          (refreshResult.data as any).refresh || refreshToken;
        api.dispatch(
          setCredentials({
            user: (api.getState() as RootState).auth.user!,
            token: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Products',
    'Orders',
    'ProductDetail',
    'Payments',
    'Deliveries',
    'Categories',
  ],
  endpoints: (builder) => ({
    register: builder.mutation<
      User,
      { username: string; email: string; password: string }
    >({
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
          // Compute role based on is_admin and is_delivery_person
          const role: Role = data.user.is_admin
            ? 'admin'
            : data.user.is_delivery_person
            ? 'delivery'
            : 'customer';
          const userWithDefaults: User = {
            ...data.user,
            is_delivery_person: data.user.is_delivery_person ?? false,
            is_admin: data.user.is_admin ?? false,
            phone_number: data.user.phone_number ?? undefined,
            role, // Add computed role
          };
          dispatch(
            setCredentials({
              user: userWithDefaults,
              token: data.access,
              refreshToken: data.refresh,
            })
          );
        } catch (error: any) {
          console.error(
            'Login failed:',
            error?.data?.detail || 'Unknown error'
          );
        }
      },
    }),
    getProfile: builder.query<User, void>({
      query: () => 'users/profile/',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: 'users/profile/update/',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getProducts: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: Product[];
      },
      { page?: number; page_size?: number }
    >({
      query: ({ page = 1, page_size = 12 } = {}) => ({
        url: 'products/',
        params: { page, page_size },
      }),
      providesTags: ['Products'],
    }),
    getOffers: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: Product[];
      },
      {
        page?: number;
        page_size?: number;
        category?: number;
        min_discount?: number;
        max_price?: number;
        sort_by?: string;
      }
    >({
      query: ({
        page = 1,
        page_size = 12,
        category,
        min_discount,
        max_price,
        sort_by,
      } = {}) => ({
        url: 'products/offers/',
        params: {
          page,
          page_size,
          ...(category && { category }),
          ...(min_discount && { min_discount }),
          ...(max_price && { max_price }),
          ...(sort_by && { sort_by }),
        },
      }),
      providesTags: ['Products'],
    }),
    getProductById: builder.query<ProductDetail, number>({
      query: (id) => `products/${id}/`,
      providesTags: (result, error, id) => [{ type: 'ProductDetail', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => 'categories/',
      providesTags: ['Categories'],
      transformResponse: (response: any) => {
        return response.results ? response.results : response;
      },
    }),
    getCategoryDetail: builder.query<
      { category: Category; products: Product[] },
      number
    >({
      query: (id) => `categories/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => 'orders/orders-list/',
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (orderId) => `orders/orders-details/${orderId}/`,
    }),
    checkout: builder.mutation<
      {
        order: Order;
        delivery_id: number;
        payment_status: string;
        message: string;
      },
      {
        cart_items: {
          product: { id: number; price: number };
          quantity: number;
        }[];
        phone_number: string;
        latitude?: number;
        longitude?: number;
      }
    >({
      query: (checkoutData) => ({
        url: 'orders/checkout/',
        method: 'POST',
        body: checkoutData,
      }),
      invalidatesTags: ['Orders', 'Payments', 'Deliveries'],
    }),
    searchProducts: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: Product[];
      },
      {
        q: string;
        category?: number;
        min_price?: number;
        max_price?: number;
        sort_by?: string;
        page?: number;
        page_size?: number;
      }
    >({
      query: ({
        q,
        category,
        min_price,
        max_price,
        sort_by,
        page = 1,
        page_size = 12,
      }) => ({
        url: 'products/search/',
        params: {
          q,
          ...(category && { category }),
          ...(min_price && { min_price }),
          ...(max_price && { max_price }),
          ...(sort_by && { sort_by }),
          page,
          page_size,
        },
      }),
      providesTags: ['Products'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetProductsQuery,
  useGetOffersQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetCategoryDetailQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCheckoutMutation,
  useSearchProductsQuery,
} = apiSlice;