'use client';

import { PRIMARY_LINKS } from '@/appdata/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';
import * as React from 'react';
import ShopMenuMegaContentNoImages from './shop-menu-mega-content-no-images';
import { usePathname, useRouter } from 'next/navigation';
import type { CategoryItem } from '@/lib/server-data';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DesktopNavProps {
  categories: CategoryItem[];
}

export default function DesktopNav({
  categories,
}: DesktopNavProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [shopOpen, setShopOpen] = React.useState(false);

  React.useEffect(() => {
    setShopOpen(false);
  }, [pathname]);

  const handleShopPrefetch = React.useCallback(() => {
    router.prefetch('/shop');
  }, [router]);

  const visibleCategories = React.useMemo(
    () =>
      (categories || []).filter(
        (c) => (c.products?.length ?? 0) > 0 && c.status === 'Show'
      ),
    [categories]
  );

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
      {/* First link (Home) */}
      <Link
        key={PRIMARY_LINKS[0].href}
        href={PRIMARY_LINKS[0].href}
        className={cn(
          'px-2 py-1 text-xs md:text-sm font-medium transition-colors',
          pathname === PRIMARY_LINKS[0].href
            ? 'text-masthead-foreground'
            : 'text-masthead-foreground/70 hover:text-masthead-foreground'
        )}
        aria-current={pathname === PRIMARY_LINKS[0].href ? 'page' : undefined}
      >
        {PRIMARY_LINKS[0].label}
      </Link>
      {/* Shop by Category - Popover opens on click only */}
      <Popover
        open={shopOpen}
        onOpenChange={(open) => {
          setShopOpen(open);
          if (open) handleShopPrefetch();
        }}
      >
        <PopoverTrigger
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs md:text-sm font-medium transition-colors',
            'text-masthead-foreground hover:text-masthead-foreground',
            'focus-visible:ring-0 focus-visible:outline-none',
            shopOpen && 'text-masthead-foreground'
          )}
          aria-label="Shop by Category"
          aria-expanded={shopOpen}
        >
          Shop by Category
          <ChevronDownIcon
            className={cn('size-3 transition-transform', shopOpen && 'rotate-180')}
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={0}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'relative w-[min(calc(100vw-2rem),32rem)] min-w-[28rem] max-w-[calc(100vw-2rem)]',
            'p-0 rounded-xl border border-border shadow-xl',
            'overflow-hidden'
          )}
        >
          <ShopMenuMegaContentNoImages
            categories={visibleCategories}
            onNavigate={() => setShopOpen(false)}
          />
        </PopoverContent>
      </Popover>
      {/* Remaining links after Shop */}
      {PRIMARY_LINKS.slice(1).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={true}
          onMouseEnter={link.href === '/shop' ? handleShopPrefetch : undefined}
          className={cn(
            'px-2 py-1 text-xs md:text-sm font-medium transition-colors',
            pathname === link.href
              ? 'text-masthead-foreground'
              : 'text-masthead-foreground/70 hover:text-masthead-foreground'
          )}
          aria-current={pathname === link.href ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
