'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

interface ShopLoadMoreTriggerProps {
  canFetchMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  hasProducts: boolean;
}

/**
 * Infinite scroll sentinel. The ref is attached to a div that triggers
 * onLoadMore when scrolled into view (via useInView in parent).
 * No button - pure infinite scroll.
 */
const ShopLoadMoreTrigger = forwardRef<HTMLDivElement, ShopLoadMoreTriggerProps>(
  ({ canFetchMore, isLoadingMore, hasProducts }, ref) => {
    if (!hasProducts) {
      return null;
    }

    return (
      <div ref={ref} className="mt-10 flex flex-col items-center gap-4">
        {canFetchMore ? (
          isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more products...</span>
            </div>
          ) : (
            /* Invisible sentinel - parent useInView triggers fetch when this scrolls into view */
            <div className="h-20 w-full" aria-hidden="true" />
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            You've reached the end of all products.
          </p>
        )}
      </div>
    );
  }
);

ShopLoadMoreTrigger.displayName = 'ShopLoadMoreTrigger';

export default ShopLoadMoreTrigger;

