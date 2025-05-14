import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../store/authSlice";
import {
  User,
  Product,
  ProductDetail,
  Order,
  Payment,
  Delivery,
  Category,
} from "../types";
import { RootState } from "../store/store";

const BASE_URL = "http://localhost:8000/api/";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
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
          url: "users/refresh/",
          method: "POST",
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
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Products",
    "Orders",
    "ProductDetail",
    "Payments",
    "Deliveries",
    "Categories",
  ],
  endpoints: (builder) => ({
    register: builder.mutation<
      User,
      { username: string; email: string; password: string }
    >({
      query: (credentials) => ({
        url: "users/register/",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<
      { user: User; access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "users/login/",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const userWithDefaults: User = {
            ...data.user,
            is_delivery_person: data.user.is_delivery_person ?? false,
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
            "Login failed:",
            error?.data?.detail || "Unknown error"
          );
        }
      },
    }),
    getProducts: builder.query<Product[], void>({
      query: () => "products/",
      providesTags: ["Products"],
    }),
    getProductById: builder.query<ProductDetail, number>({
      query: (id) => `products/${id}/`,
      providesTags: (result, error, id) => [{ type: "ProductDetail", id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => "categories/",
      providesTags: ["Categories"],
      transformResponse: (response: any) => {
        return response.results ? response.results : response;
      },
    }),
    getCategoryDetail: builder.query<
      { category: Category; products: Product[] },
      number
    >({
      query: (id) => `categories/${id}/`,
      providesTags: (result, error, id) => [{ type: "Categories", id }],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => "orders/orders-list/",
      providesTags: ["Orders"],
    }),
    getOrder: builder.query({
      query: (orderId) => `orders/orders-details/${orderId}/`,
    }),
    checkout: builder.mutation<
      { order: Order; delivery_id: number; payment_status: string; message: string },
      {
        cart_items: { product: { id: number; price: number }; quantity: number }[];
        phone_number: string;
        latitude?: number;
        longitude?: number;
      }
    >({
      query: (checkoutData) => ({
        url: "orders/checkout/",
        method: "POST",
        body: checkoutData,
      }),
      invalidatesTags: ["Orders", "Payments", "Deliveries"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetCategoryDetailQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCheckoutMutation, // Export the new checkout mutation
} = apiSlice;