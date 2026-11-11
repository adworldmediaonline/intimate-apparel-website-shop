'use client';

import { useLinkStatus } from 'next/link';
import { Loader2 } from 'lucide-react';

/**
 * ProductLinkIndicator - Reusable loading indicator for product navigation
 * 
 * Shows a subtle loading state when navigating to product details page
 * Uses useLinkStatus hook to track navigation pending state
 * 
 * Usage: Place inside a Next.js Link component that navigates to product pages
 * 
 * @example
 * ```tsx
 * <Link href={`/product/${productId}`}>
 *   <div className="product-card">
 *     <ProductImage />
 *     <ProductInfo />
 *     <ProductLinkIndicator />
 *   </div>
 * </Link>
 * ```
 */
export const ProductLinkIndicator = () => {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

/**
 * ProductLinkIndicatorMinimal - Minimal loading indicator variant
 * 
 * Shows only a small spinner in the corner without overlay
 * Best for grid layouts where full overlay might be too prominent
 */
export const ProductLinkIndicatorMinimal = () => {
  const { pending } = useLinkStatus();

  return (
    <div
      className={`absolute top-2 right-2 z-10 transition-opacity duration-200 ${
        pending ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden
    >
      <div className="w-6 h-6 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
        <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
      </div>
    </div>
  );
};

/**
 * ProductLinkIndicatorPulse - Subtle pulsing indicator
 * 
 * Shows a pulsing effect on the entire card without blocking content
 * Most subtle option, good for maintaining content visibility
 */
export const ProductLinkIndicatorPulse = () => {
  const { pending } = useLinkStatus();

  return (
    <div
      className={`absolute inset-0 rounded-lg pointer-events-none z-10 transition-all duration-200 ${
        pending
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse'
          : 'ring-0'
      }`}
      aria-hidden
    />
  );
};

/**
 * ProductLinkIndicatorShimmer - Shimmer loading effect
 * 
 * Shows an animated shimmer overlay
 * Modern, subtle feedback that doesn't block the card content
 */
export const ProductLinkIndicatorShimmer = () => {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg z-10 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
};

