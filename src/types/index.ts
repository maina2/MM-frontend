// src/types.ts

// Role type for RBAC
export type Role = 'customer' | 'admin' | 'delivery';

// User type for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string | null;
  role: Role;
  password?: string; 
}


// Category and Branch types (used in Product and Order)
export interface Category {
  id: number;
  name: string;
  description: string;
  image: string | null;
  created_at?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  is_active?: boolean;
}

// Product type
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number; 
  stock: number;
  category: Category ;
  branch: Branch | number;
  image: string | null;
  created_at: string;
  discount_percentage?: number | string; // Also string in API
  discounted_price?: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category: Category;
  branch: Branch;
  image: string | null;
  created_at: string;
  discount_percentage?: number;
  discounted_price?: number;
}

// Order Item type (used in Order)
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

// Define the status types first
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled';

// Order interface with correct payment_status type
export interface Order {
  id: number;
  customer: User;
  total_amount: string | number;
  status: OrderStatus;
  payment_status: PaymentStatus; // Changed from OrderStatus to PaymentStatus
  payment_phone_number?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  branch: string;
}

// Payment type - also update the status field to use PaymentStatus
export interface Payment {
  id: number;
  order: Order;
  amount: number;
  phone_number: string;
  status: PaymentStatus; // Changed from string to PaymentStatus for better type safety
  transaction_id: number | null;
  checkout_request_id: number | null;
  error_message?: string | null;
  payment_methods: string | null;
  created_at: string;
  updated_at: string;
}

// Delivery type
export interface Delivery {
  id: number;
  order: Order;
  delivery_person: User | null;
  status: DeliveryStatus;
  delivery_address: string;
  latitude: number | null;
  longitude: number | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export interface OptimizeRouteRequest {
  start_location: [number, number]; // [lat, lng]
  delivery_ids: number[];
}

export interface OptimizeRouteResponse {
  optimized_route: {
    lat: number;
    lng: number;
    delivery_id?: number | null; // Optional, null for start/return points
  }[];
}

// Cart Item type (for local cart state)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StatsResponse {
  users: number;
  products: number;
  orders: number;
}