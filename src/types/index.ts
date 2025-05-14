// User type for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_delivery_person: boolean;
  phone_number?: string;
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
  price: number; // Changed from string to number to match backend serialization
  stock: number;
  category: Category;
  branch: Branch;
  image: string | null;
  created_at: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number; // Changed from string to number
  stock: number;
  category: Category;
  branch: Branch;
  image: string | null;
  created_at: string;
}

// Order Item type (used in Order)
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number; // Changed from string to number to match backend serialization
}

// Order type
export interface Order {
  id: number;
  customer: User; // Changed from string to User to match backend (customer is a serialized User object)
  total_amount: number; // Changed from string to number to match backend serialization
  status: string;
  payment_status: string; // Added to match backend Order model
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Payment type
export interface Payment {
  id: number;
  order: Order;
  amount: number; // Changed from string to number to match backend serialization
  phone_number: string;
  status: string;
  transaction_id: string | null;
  checkout_request_id: string | null; // Made nullable to match backend (can be null initially)
  error_message: string | null; // Added to match backend Payment model
  created_at: string;
  updated_at: string;
}

// Delivery type
export interface Delivery {
  id: number;
  order: Order;
  delivery_person: User | null;
  status: string;
  delivery_address: string; // Kept as string, but note that the backend doesn't use this field (we're using latitude/longitude)
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