import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchControlsProps {
  sortValue: string;
  onSortChange: (value: string) => void;
  totalProducts: number;
  filteredProducts: number;
  currentPage: number;
}

const sortOptions: SortOption[] = [
  { value: 'default', label: 'Default Sorting' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function SearchControls({
  sortValue,
  onSortChange,
  totalProducts,
  filteredProducts,
  currentPage,
}: SearchControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
      {/* Results Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>
          Showing {Math.min(currentPage, filteredProducts)} of{' '}
          {filteredProducts} results
          {totalProducts !== filteredProducts && (
            <span className="ml-2 text-xs">
              (filtered from {totalProducts} total)
            </span>
          )}
        </span>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
