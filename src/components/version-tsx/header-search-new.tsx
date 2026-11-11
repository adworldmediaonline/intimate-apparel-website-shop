'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactElement } from 'react';
import DebouncedSearchInput from '@/components/common/debounced-search-input';

export interface HeaderSearchProps {
  placeholder?: string;
  className?: string;
}

export function HeaderSearch({
  placeholder = 'Search products...',
  className,
}: HeaderSearchProps): ReactElement {
  const router = useRouter();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/shop?search=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <SearchIcon
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <DebouncedSearchInput
        onSearchChange={handleSearch}
        placeholder={placeholder}
        className="h-10 sm:h-11 md:h-12 w-full rounded-full border border-border bg-background pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground caret-primary outline-none ring-0 focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-header selection:bg-primary/20 selection:text-foreground"
        debounceMs={300}
      />
    </div>
  );
}

export default HeaderSearch;

