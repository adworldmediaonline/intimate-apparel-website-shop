'use client';

import Link from 'next/link';
import * as React from 'react';
import { parseTitleSegments } from './parse-title-segments';
import { StarRating } from './star-rating';

export interface ProductCardInfoProps {
  product: { _id: string; title: string; slug: string; reviews?: Array<{ rating: number }> };
  productSlug: string;
  averageRating: number;
  showCategory?: boolean;
  showSku?: boolean;
  categoryName?: string;
  sku?: string;
  useTitleSegments?: boolean;
  className?: string;
}

export function ProductCardInfo({
  product,
  productSlug,
  averageRating,
  showCategory,
  showSku,
  categoryName,
  sku,
  useTitleSegments = true,
  className = '',
}: ProductCardInfoProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {showCategory && categoryName && (
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {categoryName}
        </div>
      )}
      <Link href={`/product/${productSlug}`} className="block">
        <h3 className="mb-1 text-xs sm:text-sm font-medium leading-tight hover:text-primary transition-colors cursor-pointer">
          {useTitleSegments
            ? parseTitleSegments(product.title).map((seg, i) =>
                seg.kind === 'inside' ? (
                  <span key={i} className="whitespace-nowrap">
                    {seg.text}
                  </span>
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )
            : product.title}
        </h3>
      </Link>
      {showSku && sku && (
        <div className="text-xs text-muted-foreground mb-1">SKU: {sku}</div>
      )}
      {product.reviews &&
        product.reviews.length > 0 &&
        averageRating > 0 && (
          <div className="mb-1.5 flex items-center gap-1">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {averageRating.toFixed(1)} ({product.reviews.length})
            </span>
          </div>
        )}
    </div>
  );
}
