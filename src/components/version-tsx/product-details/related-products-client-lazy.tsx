'use client';

import dynamic from 'next/dynamic';
import { RelatedProductsSkeleton } from './related-products-skeleton';

const RelatedProductsClient = dynamic(
  () => import('./related-products-client').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <RelatedProductsSkeleton />,
  }
);

interface RelatedProductsClientLazyProps {
  products: unknown[];
  currentProductId: string;
}

/**
 * Lazy-loaded RelatedProductsClient - defers Swiper and ProductCard bundle until needed.
 */
export default function RelatedProductsClientLazy({
  products,
  currentProductId,
}: RelatedProductsClientLazyProps) {
  return (
    <RelatedProductsClient
      products={products}
      currentProductId={currentProductId}
    />
  );
}
