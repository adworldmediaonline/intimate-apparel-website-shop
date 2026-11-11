'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
export interface ProductCardPriceProps {
  finalPrice: string;
  markedPrice?: string;
  showMarkedPrice: boolean;
  className?: string;
}

export function ProductCardPrice({
  finalPrice,
  markedPrice,
  showMarkedPrice,
  className = '',
}: ProductCardPriceProps) {
  return (
    <div
      className={`flex min-h-[1.75rem] items-center gap-1.5 sm:gap-2 mb-2 ${className}`}
      style={{ contain: 'layout' }}
    >
      {showMarkedPrice && markedPrice && (
        <span className="text-[10px] sm:text-sm text-muted-foreground line-through shrink-0">
          {CURRENCY_SYMBOL}{markedPrice}
        </span>
      )}
      <span className="text-sm sm:text-lg font-bold shrink-0">{CURRENCY_SYMBOL}{finalPrice}</span>
    </div>
  );
}
