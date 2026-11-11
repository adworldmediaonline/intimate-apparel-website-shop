'use client';

import ProductCard from '@/components/version-tsx/product-card';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';
import type { ProductBase } from '@/types/product';

interface SearchResultsProps {
  products: ProductBase[];
  currentPage: number;
  onLoadMore: () => void;
  canLoadMore: boolean;
}

export default function SearchResults({
  products,
  currentPage,
  onLoadMore,
  canLoadMore,
}: SearchResultsProps) {
  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.slice(0, currentPage).map(product => (
          <div key={product._id} className="group">
            <ProductCard
              product={product}
              variant="search"
              showCategory
              showSku
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Load More Products
            <span className="ml-2 text-sm text-primary-foreground/80">
              ({products.length - currentPage} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
