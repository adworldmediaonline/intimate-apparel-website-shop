'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryItem, toSlug } from '@/lib/server-data';


interface ShopSidebarProps {
  categories: CategoryItem[];
  activeCategory: string;
  onToggleCategory: (slug: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

const ShopSidebar = ({
  categories,
  activeCategory,
  onToggleCategory,
  onReset,
  hasActiveFilters,
  activeFiltersCount,
}: ShopSidebarProps) => {
  if (!categories.length) {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 self-start border-r border-border pr-6 lg:block lg:sticky lg:top-[10rem]">
      <div className="py-1">
        <nav className="space-y-0.5" aria-label="Product categories">
          {categories.map((category) => {
            const categorySlug = toSlug(category.parent);
            const isActiveCategory = categorySlug === activeCategory;


            return (
              <div key={category._id} className="space-y-0.5">
                <Button
                  type="button"
                  variant={isActiveCategory ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onToggleCategory(categorySlug)}
                  className={cn(
                    'min-h-9 h-auto w-full justify-between px-3 py-2 text-left text-sm font-medium whitespace-normal wrap-break-word gap-2',
                    isActiveCategory && 'shadow-sm',
                    !isActiveCategory && 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <span>{category.parent}</span>
                </Button>

              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default ShopSidebar;

