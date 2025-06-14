export interface CartTotals {
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
}

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
}

export interface NotificationProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ProductFilters {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductSortOptions {
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
}
