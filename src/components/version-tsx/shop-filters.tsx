'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CategoryItem } from '@/lib/server-data';
import { Search, X } from 'lucide-react';
import * as React from 'react';

// Consistent slug generation function - same as homepage
function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export interface ShopFilters {
  search: string;
  category: string;
  subcategory: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ShopFiltersProps {
  filters: ShopFilters;
  onFiltersChange: (filters: ShopFilters) => void;
  onClearFilters: () => void;
  categories: CategoryItem[];
}

const sortOptions = [
  { value: 'skuArrangementOrderNo-asc', label: 'Default Order' },
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
];

export default function ShopFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
}: ShopFiltersProps): React.ReactElement {
  const [localSearch, setLocalSearch] = React.useState(filters.search);
  const [isProcessingFilter, setIsProcessingFilter] = React.useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleCategoryChange = (category: string) => {
    if (isProcessingFilter) return;

    setIsProcessingFilter(true);

    const categorySlug = toSlug(category);
    const newCategory = filters.category === categorySlug ? '' : categorySlug;

    onFiltersChange({
      ...filters,
      category: newCategory,
      // IMPORTANT: Clear subcategory when selecting a new category
      subcategory: '',
    });

    // Reset processing flag after a short delay
    setTimeout(() => setIsProcessingFilter(false), 200);
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: order as 'asc' | 'desc',
    });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.sortBy || filters.sortOrder;

  return (
    <div className="w-full space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Products
        </Label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            id="search"
            placeholder="Search products..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Compact Controls Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Sort & Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {
                  [
                    filters.search,
                    filters.category,
                    filters.sortBy !== 'skuArrangementOrderNo'
                      ? filters.sortBy
                      : '',
                    filters.sortOrder !== 'asc' ? filters.sortOrder : '',
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Label>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            onValueChange={handleSortChange}
            value={`${filters.sortBy}-${filters.sortOrder}`}
          >
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 h-9 whitespace-nowrap sm:w-auto"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {categories?.map((cat: CategoryItem) => {
              const categorySlug = toSlug(cat.parent);
              const isSelected = filters.category === categorySlug;

              return (
                <Button
                  key={cat._id}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => handleCategoryChange(cat.parent)}
                >
                  <span>{cat.parent}</span>
                  <div className="flex items-center gap-1">
                    {cat.products?.length && cat.products.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {cat.products.length}
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
