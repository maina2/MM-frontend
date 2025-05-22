// src/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../store/authSlice';
import {
  User,
  Product,
  ProductDetail,
  Order,
  Role,
  Category,
  Payment,
  Delivery,
  OrderItem,
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
    'User',
    'Users',
  ],
  endpoints: (builder) => ({
    // Shared Endpoints
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
          console.log('Login Response:', JSON.stringify(data, null, 2));
          const userWithDefaults: User = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            phone_number: data.user.phone_number ?? null,
            role: data.user.role,
          };
          console.log('User with Defaults:', JSON.stringify(userWithDefaults, null, 2));
          dispatch(
            setCredentials({
              user: userWithDefaults,
              token: data.access,
              refreshToken: data.refresh,
            })
          );
          console.log('Dispatched setCredentials with user:', JSON.stringify(userWithDefaults, null, 2));
        } catch (error: any) {
          console.error('Login failed:', error?.data?.detail || 'Unknown error');
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

    // Customer Endpoints
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

    // Admin Endpoints
    getAdminUsers: builder.query<{
      count: number;
      next: string | null;
      previous: string | null;
      results: User[];
    }, { page?: number; page_size?: number }>({
      query: ({ page = 1, page_size = 10 } = {}) => ({
        url: 'users/manage/users/',
        params: { page, page_size },
      }),
      providesTags: ['Users'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => response,
    }),
    createAdminUser: builder.mutation<
      User,
      { username: string; email: string; password: string; role: Role; phone_number?: string }
    >({
      query: (data) => ({
        url: 'users/manage/users/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    updateAdminUser: builder.mutation<
      User,
      { id: number; username?: string; email?: string; role?: Role; phone_number?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `users/manage/users/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteAdminUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/manage/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Product Admin Endpoints
getAdminProducts: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: Product[];
      },
      { page?: number; page_size?: number; search?: string; category?: number }
    >({
      query: ({ page = 1, page_size = 12, search, category } = {}) => ({
        url: 'manage/products/',
        params: {
          page,
          page_size,
          ...(search && { search }),
          ...(category && { category }),
        },
      }),
      providesTags: ['Products'],
    }),
    createAdminProduct: builder.mutation<
      Product,
      {
        name: string;
        description: string;
        price: number;
        stock: number;
        category: number;
        image?: File | string;
        discount_percentage?: number;
      }
    >({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
          }
        });
        return {
          url: 'manage/products/',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Products'],
    }),
    updateAdminProduct: builder.mutation<
      Product,
      {
        id: number;
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        category?: number;
        image?: File | string;
        discount_percentage?: number;
      }
    >({
      query: ({ id, ...data }) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
          }
        });
        return {
          url: `manage/products/${id}/`,
          method: 'PUT',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Products'],
    }),
    deleteAdminProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `manage/products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),

    // Order Admin Endpoints
    getAdminOrders: builder.query<Order[], void>({
      query: () => 'manage/orders/',
      providesTags: ['Orders'],
    }),
    updateAdminOrder: builder.mutation<
      Order,
      { id: number; status?: string; payment_status?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `manage/orders/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Payment Admin Endpoints
    getAdminPayments: builder.query<Payment[], void>({
      query: () => 'manage/payments/',
      providesTags: ['Payments'],
    }),
    updateAdminPayment: builder.mutation<
      Payment,
      { id: number; status?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `manage/payments/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Orders'],
    }),

    // Delivery Admin Endpoints
    getAdminDeliveries: builder.query<Delivery[], void>({
      query: () => 'manage/deliveries/',
      providesTags: ['Deliveries'],
    }),
    updateAdminDelivery: builder.mutation<
      Delivery,
      {
        id: number;
        status?: string;
        delivery_person?: number;
        delivery_address?: string;
        latitude?: number;
        longitude?: number;
        estimated_delivery_time?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `manage/deliveries/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Deliveries'],
    }),

    // Delivery Endpoints
    getDeliveryTasks: builder.query<Delivery[], void>({
      query: () => 'delivery/tasks/',
      providesTags: ['Deliveries'],
    }),
    updateDeliveryTask: builder.mutation<
      Delivery,
      {
        id: number;
        status?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `delivery/tasks/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Deliveries'],
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
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderMutation,
  useGetAdminPaymentsQuery,
  useUpdateAdminPaymentMutation,
  useGetAdminDeliveriesQuery,
  useUpdateAdminDeliveryMutation,
  useGetDeliveryTasksQuery,
  useUpdateDeliveryTaskMutation,
} = apiSlice;