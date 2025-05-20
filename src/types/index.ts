// src/types.ts

// Role type for RBAC
export type Role = 'customer' | 'admin' | 'delivery';

// User type for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_delivery_person: boolean;
  phone_number?: string | null; 
  role: Role;
}


// Category and Branch types (used in Product)
export interface Category {
  id: number;
  name: string;
  description: string;
  image: string | null;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
}

// Product type
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  branch: Branch;
  image: string | null;
  created_at: string;
  discount_percentage?: number;
  discounted_price?: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
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

// Order type
export interface Order {
  id: number;
  customer: User;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Payment type
export interface Payment {
  id: number;
  order: Order;
  amount: number;
  phone_number: string;
  status: string;
  transaction_id: string | null;
  checkout_request_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Delivery type
export interface Delivery {
  id: number;
  order: Order; // Fixed: Removed invalid firewall artifact
  delivery_person: User | null;
  status: string;
  delivery_address: string;
  latitude: number | null;
  longitude: number | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

// Cart Item type (for local cart state)
export interface CartItem {
  product: Product;
  quantity: number;
}