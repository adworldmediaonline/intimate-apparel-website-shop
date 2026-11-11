'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import ShopEmptyState from '@/features/shop/components/shop-empty-state';
import ShopLoadMoreTrigger from '@/features/shop/components/shop-load-more-trigger';

const ShopMobileFilters = dynamic(
  () =>
    import('@/features/shop/components/shop-mobile-filters').then(
      (mod) => mod.default
    ),
  { loading: () => <div className="mb-3 lg:hidden h-10 w-full" /> }
);
import ShopProductGrid from '@/features/shop/components/shop-product-grid';
import ShopSidebar from '@/features/shop/components/shop-sidebar';
import ShopToolbar from '@/features/shop/components/shop-toolbar';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';
import { useShopProducts } from '@/features/shop/hooks/use-shop-products';
import { useShopQueryState } from '@/features/shop/hooks/use-shop-query-state';
import { DEFAULT_FILTERS } from '@/features/shop/shop-types';
import type {
  ShopFiltersState,
  ShopPagination,
  ShopProduct,
} from '@/features/shop/shop-types';
import { CategoryItem } from '@/lib/server-data';

interface ShopContentWrapperProps {
  categories: CategoryItem[];
  /** SSR initial products for instant first paint */
  initialProducts?: ShopProduct[];
  /** SSR initial pagination */
  initialPagination?: ShopPagination | null;
  /** Filters used for SSR fetch; use initial when client filters match */
  initialFilters?: ShopFiltersState;
}

const ShopContentWrapper = ({
  categories,
  initialProducts = [],
  initialPagination = null,
  initialFilters,
}: ShopContentWrapperProps) => {
  const {
    filters,
    setSearch,
    setSort,
    toggleCategory,
    resetFilters,
    hasActiveFilters,
    sortKey,
  } = useShopQueryState();

  const {
    products,
    pagination,
    status,
    errorMessage,
    isLoading,
    isLoadingMore,
    fetchNext,
    reset: resetProducts,
    refresh,
    canFetchMore,
  } = useShopProducts(filters, {
    initialProducts,
    initialPagination,
    initialFilters,
  });

  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  const activeFiltersCount = useMemo(() => {
    return [
      filters.search.trim() ? 1 : 0,
      filters.category ? 1 : 0,
      filters.subcategory ? 1 : 0,
      filters.sortBy !== DEFAULT_FILTERS.sortBy ? 1 : 0,
      filters.sortOrder !== DEFAULT_FILTERS.sortOrder ? 1 : 0,
    ].filter(Boolean).length;
  }, [filters]);

  const totalProducts = pagination?.totalProducts ?? products.length;

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '200px 0px',
    threshold: 0,
  });

  const shopContentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Scroll to the shop content container (toolbar + products) so the filter banner
    // stays visible and the product section is in view
    shopContentRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'start',
    });
  }, [filters.category, filters.subcategory]);

  useEffect(() => {
    if (!inView || !canFetchMore || isLoadingMore) {
      return;
    }

    // Debounce the fetch trigger to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      fetchNext();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [inView, canFetchMore, isLoadingMore, fetchNext]);

  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split('-');
      void setSort(sortBy, sortOrder === 'desc' ? 'desc' : 'asc');
    },
    [setSort]
  );

  const handleClearFilters = useCallback(() => {
    resetProducts();
    void resetFilters();
  }, [resetFilters, resetProducts]);

  const showEmptyState =
    !isLoading && products.length === 0 && status !== 'error';

  const showErrorState = status === 'error';

  return (
    <>
      <div
        ref={shopContentRef}
        className="min-h-screen bg-background py-2 lg:py-6 scroll-mt-[11rem]"
      >
        {/* Full-width toolbar above category filter and content */}
        <div className="w-full mb-4 lg:mb-6">
          <ShopToolbar
            initialSearch={filters.search}
            onSearchCommit={value => {
              void setSearch(value);
            }}
            sortKey={sortKey}
            onSortChange={handleSortChange}
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
            totalProducts={totalProducts}
          />
        </div>

        {/* Mobile: Filters button between toolbar and grid */}
        <div className="mb-3 lg:hidden">
          <ShopMobileFilters
            categories={categories}
            activeCategory={filters.category}
            onToggleCategory={toggleCategory}
            onReset={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Sidebar + content aligned on same horizontal top line */}
        <div className="flex w-full items-start gap-4 lg:gap-8">
          <ShopSidebar
            categories={categories}
            activeCategory={filters.category}
            onToggleCategory={toggleCategory}
            onReset={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
          />

          <section
            className="min-w-0 flex-1 space-y-6"
            aria-label="Products"
          >
            {showErrorState ? (
              <ShopEmptyState
                variant="error"
                onReset={refresh}
                message={errorMessage}
              />
            ) : showEmptyState ? (
              <ShopEmptyState variant="empty" onReset={handleClearFilters} />
            ) : (
              <>
                {isLoading && products.length === 0 ? (
                  <div
                    className="flex min-h-[50vh] w-full items-center justify-center"
                    aria-label="Loading products"
                  >
                    <Loader2
                      className="h-10 w-10 animate-spin text-primary"
                      aria-hidden
                    />
                  </div>
                ) : (
                  <ShopProductGrid
                    products={products}
                    isLoading={isLoading}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                )}

                <ShopLoadMoreTrigger
                  ref={loadMoreRef}
                  canFetchMore={canFetchMore}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={fetchNext}
                  hasProducts={products.length > 0}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ShopContentWrapper;
