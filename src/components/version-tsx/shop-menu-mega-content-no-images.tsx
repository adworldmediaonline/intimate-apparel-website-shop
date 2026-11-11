'use client';

import Link from 'next/link';
import * as React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { toSlug } from '@/lib/server-data';
import { sortByCategoryOrder } from '@/lib/category-order';
import type { CategoryItem } from '@/lib/server-data';
import { cn } from '@/lib/utils';

export interface ShopMenuMegaContentNoImagesProps {
  /** Raw categories from getCategoriesShow */
  categories: CategoryItem[];
  /** Called when a category link is clicked (e.g. to close the dropdown) */
  onNavigate?: () => void;
}

/**
 * A shop category. Subcategories are deliberately not surfaced in the menus:
 * the catalogue's children are fabric notes ("Silk and Polyester") rather than
 * things a shopper browses by, and they made the menu two levels deep for no
 * gain. `/shop?subcategory=` still works if a link to one is shared.
 */
export interface ParentCategory {
  parent: string;
  parentSlug: string;
  href: string;
}

export function buildParentList(categories: CategoryItem[]): ParentCategory[] {
  const seen = new Set<string>();
  const result: ParentCategory[] = [];

  for (const cat of categories) {
    const parent = cat.parent || '';
    const parentSlug = toSlug(parent);
    if (!parent || seen.has(parentSlug)) continue;
    seen.add(parentSlug);

    result.push({ parent, parentSlug, href: `/shop?category=${parentSlug}` });
  }

  return sortByCategoryOrder(result, item => item.parent);
}

export default function ShopMenuMegaContentNoImages({
  categories,
  onNavigate,
}: ShopMenuMegaContentNoImagesProps): React.ReactElement {
  const parentList = React.useMemo(
    () => buildParentList(categories),
    [categories]
  );

  if (parentList.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">
          No categories available at the moment.
        </p>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none rounded-md"
          aria-label="Explore all products"
        >
          Explore all
          <ArrowRight className="ml-1 h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="relative flex max-h-[min(85vh,32rem)] flex-col overflow-y-auto p-2"
      role="menu"
      aria-label="Shop categories"
    >
      {parentList.map(item => (
        <Link
          key={item.parentSlug}
          href={item.href}
          onClick={onNavigate}
          role="menuitem"
          className={cn(
            'flex min-h-[44px] items-center gap-3 rounded-md px-4 py-3',
            'text-sm font-semibold text-foreground transition-colors',
            'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <span className="min-w-0 flex-1 break-words text-left">{item.parent}</span>
          <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden />
        </Link>
      ))}

      <Link
        href="/shop"
        onClick={onNavigate}
        role="menuitem"
        className="mt-1 flex min-h-[44px] items-center gap-2 rounded-md border-t border-border px-4 py-3 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Shop all
        <ArrowRight className="size-4 shrink-0" aria-hidden />
      </Link>
    </div>
  );
}
