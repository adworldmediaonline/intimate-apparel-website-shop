'use client';

import { Filter, Search, X } from 'lucide-react';

import DebouncedSearchInput from '@/components/common/debounced-search-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { SHOP_SORT_OPTIONS } from '../shop-types';

interface ShopToolbarProps {
  initialSearch: string;
  onSearchCommit: (value: string) => void;
  sortKey: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalProducts?: number;
}

const ToolbarSeparator = () => (
  <div
    className="h-6 w-px shrink-0 bg-border"
    role="presentation"
    aria-hidden
  />
);

const ShopToolbar = ({
  initialSearch,
  onSearchCommit,
  sortKey,
  onSortChange,
  hasActiveFilters,
  activeFiltersCount,
  onClearFilters,
  totalProducts,
}: ShopToolbarProps) => {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Mobile: Compact bordered strip */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:hidden">
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <DebouncedSearchInput
            initialValue={initialSearch}
            onSearchChange={onSearchCommit}
            placeholder="Search..."
            className="h-9 pl-8 text-xs"
          />
        </div>

        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[90px] text-[10px] px-2">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SHOP_SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 w-9 shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Clear ${activeFiltersCount} filters`}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : typeof totalProducts === 'number' ? (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            {totalProducts}
          </span>
        ) : null}
      </div>

      {/* Desktop: Bordered strip with Filters label, search, sort, count, clear */}
      <div className="hidden sm:block rounded-lg border border-border bg-muted/20 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Filters label */}
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span>Filters</span>
          </div>

          <ToolbarSeparator />

          {/* Search with icon */}
          <div className="relative min-w-0 flex-1 max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <DebouncedSearchInput
              initialValue={initialSearch}
              onSearchChange={onSearchCommit}
              placeholder="Search products..."
              className="h-10 pl-9"
            />
          </div>

          <ToolbarSeparator />

          {/* Sort */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select value={sortKey} onValueChange={onSortChange}>
              <SelectTrigger className="h-10 w-44">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                {SHOP_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(typeof totalProducts === 'number' || hasActiveFilters) && (
            <>
              <ToolbarSeparator />
              <div className="flex shrink-0 items-center gap-3">
                {typeof totalProducts === 'number' ? (
                  <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                  </span>
                ) : null}

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-9 gap-1.5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Clear ${activeFiltersCount} filters`}
                  >
                    <X className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Clear ({activeFiltersCount})
                    </span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopToolbar;
