export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  CANCELED = "CANCELED",
  DELIVERED = "DELIVERED",
  RETURN = "RETURN",
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  categoryId: string;
  category?: ProductCategory;
  reviews?: Review[];
  priceLKR: number;
  priceUSD: number;
  stock: number;
  orderItems?: OrderItem[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  products?: Product[];
}

export interface Review {
  id: string;
  productId: string;
  product?: Product;
  userId: string;
  customer?: Customer;
  rating: number;
  review?: string;
  date: Date;
}

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  passwordHash?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isRegistered: boolean;
  registeredAt: Date;
  orders?: Order[];
  reviews?: Review[];
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  products?: OrderItem[];
  orderDate: Date;
  deliveredAt?: Date;
  total: number;
  status: OrderStatus;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  image?: string;
}

export interface Settings {
  id: string;
  phoneNumber?: string;
  email?: string;
  links: string[];
}
