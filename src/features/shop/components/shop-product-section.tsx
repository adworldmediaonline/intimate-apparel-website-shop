import ShopContentWrapper from '@/components/version-tsx/shop-content-wrapper';
import type { CategoryItem } from '@/lib/server-data';
import type {
  ShopFiltersState,
  ShopPagination,
  ShopProduct,
} from '@/features/shop/shop-types';

interface ShopProductSectionProps {
  categories: CategoryItem[];
  initialProducts: ShopProduct[];
  initialPagination: ShopPagination | null;
  initialFilters: ShopFiltersState;
}

export function ShopProductSection({
  categories,
  initialProducts,
  initialPagination,
  initialFilters,
}: ShopProductSectionProps) {
  return (
    <ShopContentWrapper
      categories={categories}
      initialProducts={initialProducts}
      initialPagination={initialPagination}
      initialFilters={initialFilters}
    />
  );
}
