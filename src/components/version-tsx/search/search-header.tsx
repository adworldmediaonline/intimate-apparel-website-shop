import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Package } from 'lucide-react';

interface SearchHeaderProps {
  searchText?: string;
  totalProducts: number;
  filteredProducts: number;
}

export default function SearchHeader({
  searchText,
  totalProducts,
  filteredProducts,
}: SearchHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                Search Results
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Search Results
            </h1>
            {searchText && (
              <p className="text-base text-muted-foreground">
                Results for{' '}
                <span className="font-semibold text-foreground">
                  "{searchText}"
                </span>
              </p>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Package className="h-4 w-4 mr-2" />
              {filteredProducts}{' '}
              {filteredProducts === 1 ? 'product' : 'products'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
