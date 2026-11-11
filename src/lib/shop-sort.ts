/**
 * Sort options for the shop toolbar.
 *
 * Only sorts the catalogue can actually perform are listed. "Top Rated" used to
 * be offered here and was dropped: no product carries a `rating`, and none has a
 * review, so it could only ever have reordered by a missing field. "Best
 * Selling" is kept — `sellCount` is 0 across the catalogue today, so it reads as
 * the default order for now, but it starts working the moment there are sales.
 */
export interface ShopSortOption {
  /** Value in the `sort` query param. */
  key: string;
  label: string;
  /** Field name the backend whitelists in `getPaginatedProductsService`. */
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const SHOP_SORTS: ShopSortOption[] = [
  // The store's own arrangement from the admin panel — the shop's default.
  { key: 'featured', label: 'Featured', sortBy: 'skuArrangementOrderNo', sortOrder: 'asc' },
  { key: 'best-selling', label: 'Best Selling', sortBy: 'sellCount', sortOrder: 'desc' },
  { key: 'price-asc', label: 'Price: Low to High', sortBy: 'finalPriceDiscount', sortOrder: 'asc' },
  { key: 'price-desc', label: 'Price: High to Low', sortBy: 'finalPriceDiscount', sortOrder: 'desc' },
  { key: 'newest', label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
];

export const DEFAULT_SHOP_SORT = SHOP_SORTS[0];

/** The option for a `sort` param value, falling back to Featured. */
export function resolveShopSort(key?: string | null): ShopSortOption {
  return SHOP_SORTS.find(s => s.key === key) ?? DEFAULT_SHOP_SORT;
}
