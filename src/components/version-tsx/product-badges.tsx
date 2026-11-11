'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Badge position variants for ProductBadges component
 * - 'default': Displays badges in the product info section (after title)
 * - 'top-left': Displays badges as overlay on image, top-left corner
 * - 'top-right': Displays badges as overlay on image, top-right corner
 */
export type BadgePositionVariant = 'default' | 'top-left' | 'top-right';

interface ProductBadgesProps {
  /** Array of badge strings to display */
  badges: string[];
  /** Position variant for badge display */
  variant?: BadgePositionVariant;
  /** Additional className for the container */
  className?: string;
  /** Additional className for individual badges */
  badgeClassName?: string;
}

const ProductBadges: React.FC<ProductBadgesProps> = ({
  badges,
  variant = 'default',
  className,
  badgeClassName,
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  // Default variant - in product info section
  if (variant === 'default') {
    return (
      <div
        className={cn(
          'mb-1.5 flex flex-wrap gap-1 sm:gap-1.5',
          className
        )}
      >
        {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="destructive"
            className={cn(
              'text-[8px] sm:text-[9px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 font-medium leading-tight whitespace-nowrap',
              badgeClassName
            )}
          >
            {badge}
          </Badge>
        ))}
      </div>
    );
  }

  // Top-left variant - overlay on image
  if (variant === 'top-left') {
    return (
      <div
        className={cn(
          'absolute left-1 top-1 sm:left-2 sm:top-2 z-10 flex flex-col gap-1 sm:gap-1.5',
          className
        )}
      >
        {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="destructive"
            className={cn(
              'text-[8px] sm:text-[9px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 font-medium leading-tight whitespace-nowrap shadow-md',
              badgeClassName
            )}
          >
            {badge}
          </Badge>
        ))}
      </div>
    );
  }

  // Top-right variant - overlay on image
  if (variant === 'top-right') {
    return (
      <div
        className={cn(
          'absolute right-1 top-1 sm:right-2 sm:top-2 z-10 flex flex-col gap-1 sm:gap-1.5',
          className
        )}
      >
        {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="destructive"
            className={cn(
              'text-[8px] sm:text-[9px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 font-medium leading-tight whitespace-nowrap shadow-md',
              badgeClassName
            )}
          >
            {badge}
          </Badge>
        ))}
      </div>
    );
  }

  return null;
};

export default ProductBadges;
