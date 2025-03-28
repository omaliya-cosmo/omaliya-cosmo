import { ObjectId } from 'mongoose';

// Product Type
export interface Product {
  _id: string;
  name: string;
  price: number;
  category_id: string;
  description?: {
    en: string;
    si: string;
  };
}

// Customer Type
export interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password_hash?: string;
  address?: string;
  country?: string;
  is_registered?: boolean;
  registered_date?: Date;
}

// Order Type
export interface Order {
  _id: string;
  customer_id: string | Customer;
  products: {
    product: string | Product;
    quantity: number;
  }[];
  order_date: Date;
  delivered_date?: Date;
  total: number;
  status: 'pending' | 'delivered' | 'returned' | 'cancelled';
  notes?: string;
}

// Refund Type
export interface Refund {
  order_id: string;
  customer_id: string;
  product: string | Product;
  status: string;
  reason: string;
  rejection_reason?: string;
  request_date: Date;
}

// Category Type
export interface Category {
  _id: string;
  category_name: {
    en: string;
    si: string;
  };
  description: {
    en: string;
    si: string;
  };
}

// Admin Type
export interface Admin {
  username: string;
  password_hash: string;
  image?: string;
}

// Settings Type
export interface Settings {
  phone_number: string;
  email: string;
  links: string[];
  banner?: string;
  best_items?: string[];
}

// CheckoutItem Type (Added for dummy payment gateway)
export interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
}