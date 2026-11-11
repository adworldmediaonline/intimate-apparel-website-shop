import { getRelatedProducts } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import RelatedProductsClientLazy from './related-products-client-lazy';

interface RelatedProductsServerProps {
  productId: string;
}

/**
 * Server component for related products.
 * No caching - fetches fresh data on every request.
 *
 * `connection()` marks this as the dynamic (streamed) hole of the product page's PPR:
 * the page shell + Product schema prerender statically, while this below-the-fold
 * no-store fetch streams in per request (and doesn't break prerendering of the shell).
 */
export default async function RelatedProductsServer({
  productId,
}: RelatedProductsServerProps) {
  await connection();
  const raw = await getRelatedProducts(productId);
  const relatedProducts = await enrichProductsWithDisplayPrices(raw);

  // Empty state
  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Related Products Found
        </h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find any related products at the moment.
        </p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  // Delegate to lazy client component (Swiper, cart actions) - defers bundle load
  return (
    <RelatedProductsClientLazy
      products={relatedProducts}
      currentProductId={productId}
    />
  );
}

