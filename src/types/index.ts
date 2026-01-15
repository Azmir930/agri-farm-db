// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'buyer' | 'farmer' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  farmerId: string;
  farmerName: string;
  images: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// Order types
export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

// Address type
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// Review types
export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Analytics types
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeProducts: number;
}
