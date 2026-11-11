'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import type { CategoryItem } from '@/lib/server-data';
import { CategoryCard } from './categories/category-card';

export interface ShopMenuMegaContentProps {
  /** Raw categories from getCategoriesShow – same as homepage showcase */
  categories: CategoryItem[];
}

/**
 * Shop dropdown reuses the same category showcase as the Homepage for consistency.
 * Processes categories with showcaseGroups and renders CategoryCard grid.
 */
export default function ShopMenuMegaContent({
  categories,
}: ShopMenuMegaContentProps): React.ReactElement {
  const processed = processCategoriesForShowcase(categories);

  return (
    <div
      className="max-h-[min(85vh,32rem)] overflow-y-auto overflow-x-hidden"
      role="menu"
      aria-label="Shop categories"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {processed.map((item, index) => (
          <CategoryCard
            key={item._id}
            item={item}
            index={index}
            variant="mega"
          />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center py-3 text-sm font-medium text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none rounded-md px-1 -ml-1"
          aria-label="Explore all categories"
        >
          Explore all
          <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
