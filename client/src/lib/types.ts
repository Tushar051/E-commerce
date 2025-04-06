// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: number;
  brand: string;
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featuredImage: string;
  isNew: boolean;
  isFeatured: boolean;
  isSale: boolean;
  createdAt: string;
  images?: ProductImage[];
  category?: Category;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt: string | null;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

// Cart Types
export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product?: Product;
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  addedAt: string;
  product?: Product;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
}

// API Response Types
export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
}

// Filter Types
export interface ProductFilters {
  categoryId?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
