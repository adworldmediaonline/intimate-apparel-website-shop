'use client';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { isOutOfStock } from '@/lib/product-stock';

export default function ProductDetailsFixedBar({ productItem, onAddToCart }) {
  const outOfStock = isOutOfStock(productItem);


  return (
    <>
      {/* Fixed Bottom Bar for Mobile - Add to Cart & Proceed to Buy */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background border-t border-border shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.75rem)' }}
      >
        <div className="container mx-auto px-4 py-3">
          <Button
            onClick={() => onAddToCart?.(productItem)}
            disabled={outOfStock}
            size="lg"
            className="w-full h-12 text-base font-medium"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bar on mobile */}
      <div className="h-20 md:h-0" />
    </>
  );
}

