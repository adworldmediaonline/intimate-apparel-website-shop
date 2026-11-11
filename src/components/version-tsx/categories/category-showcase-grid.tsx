'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { getCategoriesShow } from '@/server/categories';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import { sortByCategoryOrder as sortByStoreCategoryOrder } from '@/lib/category-order';
import { CategoryCard, type CategoryItem } from './category-card';

interface CategoryShowcaseGridProps {
  /** Optional custom order of category IDs. Categories not in this array appear after. */
  categoryOrder?: string[];
  /** Pre-fetched categories; when provided, skips internal fetch (for parallel loading) */
  categories?: unknown[];
}

/**
 * Fetches categories from DB and renders the grid.
 * Uses showcaseGroups from each category (configured in Admin) for grouping/splitting.
 */
export async function CategoryShowcaseGrid({ categoryOrder, categories: categoriesProp }: CategoryShowcaseGridProps) {
  // Categories, like the header's list — a 'minutes' lifetime made this a
  // per-minute ISR write on every page that renders it.
  cacheLife('days');
  // This unit caches the rendered grid, so it needs the tag itself — the one
  // inside getCategoriesShow() does not reach the markup cached here.
  cacheTag('categories');
  const categories = Array.isArray(categoriesProp)
    ? (categoriesProp as CategoryItem[])
    : await getCategoriesShow();
  const processed = processCategoriesForShowcase(categories);
  const processedCategories = sortByCategoryOrder(processed, categoryOrder);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
      {processedCategories.map((item: CategoryItem, index: number) => (
        <CategoryCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
}

/**
 * CMS sections can pin their own order by category id. Without one, fall back to
 * the store-wide order rather than whatever order the API happened to return.
 */
function sortByCategoryOrder(
  categories: CategoryItem[],
  order?: string[]
): CategoryItem[] {
  if (!order?.length) {
    return sortByStoreCategoryOrder(categories, c => c.parent);
  }
  const orderMap = new Map(order.map((id, i) => [id, i]));
  return [...categories].sort((a, b) => {
    const idxA = orderMap.get(a._id) ?? order.length;
    const idxB = orderMap.get(b._id) ?? order.length;
    return idxA - idxB;
  });
}
