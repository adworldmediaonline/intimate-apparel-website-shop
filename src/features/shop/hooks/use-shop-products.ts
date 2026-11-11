'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  SHOP_PAGE_SIZE,
  type ShopFiltersState,
  type ShopPagination,
  type ShopProduct,
  type ShopQueryArgs,
} from '../shop-types';

import { useLazyGetPaginatedProductsQuery } from '@/redux/features/productApi';
import { authClient } from '@/lib/authClient';
import { trackSearchQuery } from '@/lib/search-analytics/track-search';

type Status = 'idle' | 'loading' | 'loading-more' | 'success' | 'error';

const toQueryArgs = (filters: ShopFiltersState, page: number): ShopQueryArgs => ({
  ...filters,
  page,
  limit: SHOP_PAGE_SIZE,
});

const filtersMatchDefault = (f: ShopFiltersState) =>
  f.search === '' &&
  f.category === '' &&
  f.subcategory === '' &&
  f.sortBy === 'skuArrangementOrderNo' &&
  f.sortOrder === 'asc';

const filtersMatch = (a: ShopFiltersState, b: ShopFiltersState) =>
  a.search === b.search &&
  a.category === b.category &&
  a.subcategory === b.subcategory &&
  a.sortBy === b.sortBy &&
  a.sortOrder === b.sortOrder;

export interface UseShopProductsOptions {
  initialProducts?: ShopProduct[];
  initialPagination?: ShopPagination | null;
  /** Filters used for SSR fetch; use initial when client filters match */
  initialFilters?: ShopFiltersState;
}

export const useShopProducts = (
  filters: ShopFiltersState,
  options: UseShopProductsOptions = {}
) => {
  const { initialProducts = [], initialPagination = null, initialFilters } = options;

  const hasInitialData =
    initialProducts.length > 0 || (initialPagination && initialPagination.totalProducts > 0);
  const shouldUseInitial =
    hasInitialData &&
    (filtersMatchDefault(filters) ||
      (initialFilters != null && filtersMatch(filters, initialFilters)));

  const [{ data: items, pagination }, setResult] = useState<{
    data: ShopProduct[];
    pagination: ShopPagination | null;
  }>(() =>
    shouldUseInitial
      ? { data: initialProducts, pagination: initialPagination }
      : { data: [], pagination: null }
  );
  const [status, setStatus] = useState<Status>(
    shouldUseInitial ? 'success' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const isMountedRef = useRef(true);
  const pendingResetRef = useRef(false);
  const currentFetchRef = useRef<string | null>(null);
  const usedInitialRef = useRef(shouldUseInitial);

  const [fetchProducts] = useLazyGetPaginatedProductsQuery();
  const { data: session } = authClient.useSession();

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search,
        category: filters.category,
        subcategory: filters.subcategory,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
    [filters]
  );

  const filtersSnapshot = useMemo(() => ({ ...filters }), [filters]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    pendingResetRef.current = true;
    currentFetchRef.current = null;
    setPage(1);
    const shouldUseInitial =
      hasInitialData &&
      (filtersMatchDefault(filtersSnapshot) ||
        (initialFilters && filtersMatch(filtersSnapshot, initialFilters)));
    const useInitial = Boolean(shouldUseInitial);
    setResult(
      useInitial
        ? { data: initialProducts, pagination: initialPagination }
        : { data: [], pagination: null }
    );
    setStatus(useInitial ? 'success' : 'loading');
    usedInitialRef.current = useInitial;
  }, [filtersKey]);

  /**
   * Record the search, whoever fetched the results.
   *
   * This used to live inside the fetch below, which is skipped whenever SSR
   * already supplied the data for these filters. A search typed in the
   * header navigates to /shop?search=..., so the server renders the results
   * and the client fetch never runs — meaning the common case, and for a
   * while every case, was never recorded. Hence an empty `searchqueries`
   * collection.
   *
   * Keyed off settled results instead, so SSR and client fetches both count.
   * `trackSearchQuery` dedupes on keyword + result count, so re-running this
   * effect cannot inflate the numbers.
   */
  useEffect(() => {
    if (status !== 'success') return;
    const committedSearch = filtersSnapshot.search?.trim();
    if (!committedSearch) return;

    trackSearchQuery({
      keyword: committedSearch,
      resultsCount: pagination?.totalProducts ?? null,
      userId: session?.user?.id ?? null,
      userEmail: session?.user?.email ?? null,
      source: filtersSnapshot.category ? 'shop-category' : 'shop',
    });
  }, [
    status,
    filtersSnapshot.search,
    filtersSnapshot.category,
    pagination?.totalProducts,
    session?.user?.id,
    session?.user?.email,
  ]);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      const isInitialPage = page === 1;

      // Skip fetch when we have SSR initial data and filters match what we fetched
      if (
        isInitialPage &&
        usedInitialRef.current &&
        (filtersMatchDefault(filtersSnapshot) ||
          (initialFilters && filtersMatch(filtersSnapshot, initialFilters)))
      ) {
        pendingResetRef.current = false; // Allow load-more to proceed
        return;
      }

      if (pendingResetRef.current) {
        if (!isInitialPage) {
          return;
        }

        pendingResetRef.current = false;
      }

      // Prevent duplicate fetches for the same filter/page combination
      const fetchKey = `${filtersKey}-${page}`;
      if (currentFetchRef.current === fetchKey) {
        return;
      }

      currentFetchRef.current = fetchKey;

      setStatus(isInitialPage ? 'loading' : 'loading-more');
      setErrorMessage(null);

      try {
        const result = await fetchProducts(
          toQueryArgs(filtersSnapshot, page)
        ).unwrap();

        if (ignore || !isMountedRef.current) {
          return;
        }

        setResult(prev => {
          if (isInitialPage) {
            return {
              data: result.data,
              pagination: result.pagination,
            };
          }

          // Deduplicate products by _id to prevent duplicates
          const existingIds = new Set(prev.data.map(p => p._id));
          const newProducts = result.data.filter(p => !existingIds.has(p._id));

          return {
            data: [...prev.data, ...newProducts],
            pagination: result.pagination,
          };
        });

        setStatus('success');
        // Clear fetch ref after successful load to allow next fetch
        currentFetchRef.current = null;

      } catch (error) {
        if (ignore || !isMountedRef.current) {
          return;
        }

        setStatus('error');
        // Clear fetch ref on error to allow retry
        currentFetchRef.current = null;

        const message =
          typeof error === 'object' && error && 'data' in error
            ? // @ts-expect-error - RTK Query error typing
            error.data?.message ?? 'Failed to load products.'
            : 'Failed to load products.';

        setErrorMessage(message);
      }
    };

    void loadProducts();

    return () => {
      ignore = true;
    };
  }, [fetchProducts, filtersSnapshot, page, reloadKey, filtersKey, initialFilters]);

  const fetchNext = useCallback(() => {
    // Prevent multiple calls while already loading
    if (status === 'loading' || status === 'loading-more') {
      return;
    }

    // Check if there are more pages
    if (!pagination?.hasNextPage) {
      return;
    }

    // Increment page to trigger fetch
    setPage(prev => prev + 1);
  }, [pagination?.hasNextPage, status]);

  const reset = useCallback(() => {
    pendingResetRef.current = true;
    setPage(1);
    setResult({ data: [], pagination: null });
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const refresh = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setReloadKey(previous => previous + 1);
  }, []);

  return {
    products: items,
    pagination,
    status,
    errorMessage,
    isLoading: status === 'loading',
    isLoadingMore: status === 'loading-more',
    fetchNext,
    reset,
    refresh,
    canFetchMore: Boolean(pagination?.hasNextPage),
  } as const;
};

