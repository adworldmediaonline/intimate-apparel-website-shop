'use client';

import ProductCard from '@/components/version-tsx/product-card';
import ProductSkeleton from '@/components/version-tsx/product-skeleton';
import type { AddToCartProduct, ShopProduct } from '../shop-types';
import type { ProductBase } from '@/types/product';

interface ShopProductGridProps {
  products: ShopProduct[];
  isLoading: boolean;
  onAddToCart: (product: AddToCartProduct, selectedOption?: { title: string; price: number }) => void;
  onAddToWishlist: (product: ProductBase | ShopProduct) => void;
}

const PLACEHOLDER_COUNT = 8;

const ShopProductGrid = ({
  products,
  isLoading,
  onAddToCart,
  onAddToWishlist,
}: ShopProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={`${product._id}-${index}`}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          index={index}
        />
      ))}

      {isLoading && products.length === 0
        ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, skeletonIndex) => (
          <ProductSkeleton key={`skeleton-${skeletonIndex}`} />
        ))
        : null}
    </div>
  );
};

export default ShopProductGrid;

