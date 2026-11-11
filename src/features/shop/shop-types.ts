import type { Product, ProductBase } from '@/types/product';

export const SHOP_PAGE_SIZE = 12;

/** Product shape acceptable for add-to-cart (includes computed fields from ProductCard) */
export type AddToCartProduct = ProductBase & {
  finalPriceDiscount?: number;
  basePrice?: number;
  appliedCouponCode?: string;
  options?: Array<{ title: string; price: number }>;
};

export type SortDirection = 'asc' | 'desc';

export interface ShopFiltersState {
  search: string;
  category: string;
  subcategory: string;
  sortBy: string;
  sortOrder: SortDirection;
}

export interface ShopQueryArgs extends ShopFiltersState {
  page?: number;
  limit?: number;
}

export interface ShopPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ShopProduct = Product;

export interface ShopProductsResult {
  data: ShopProduct[];
  pagination: ShopPagination;
}

export const DEFAULT_FILTERS: ShopFiltersState = {
  search: '',
  category: '',
  subcategory: '',
  sortBy: 'skuArrangementOrderNo',
  sortOrder: 'asc',
};

export const SHOP_SORT_FIELDS = [
  'skuArrangementOrderNo',
  'createdAt',
  'price',
  'title',
] as const;

export const SHOP_SORT_ORDERS: SortDirection[] = ['asc', 'desc'];

export const SHOP_SORT_OPTIONS = [
  { value: 'skuArrangementOrderNo-asc', label: 'Default Order' },
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
] as const;

