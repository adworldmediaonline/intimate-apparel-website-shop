'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChevronRight, Heart, Menu, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import type { CategoryItem } from '@/lib/server-data';
import { API_ENDPOINT } from '@/server/api-endpoint';
import { buildParentList } from './shop-menu-mega-content-no-images';

export interface HeaderMenuButtonProps {
  links: { href: string; label: string }[];
  categories?: CategoryItem[];
}

/** Match desktop: Show categories with products */
const visibleCategoriesFilter = (c: CategoryItem) =>
  (c.products?.length ?? 0) > 0 && (c.status === 'Show' || !c.status);

const fetchCategoriesClient = async (): Promise<CategoryItem[]> => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) return [];
  try {
    const res = await fetch(`${base}${API_ENDPOINT.CATEGORIES}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.result) ? data.result : [];
  } catch {
    return [];
  }
};

export function HeaderMenuButton({
  links,
  categories = [],
}: HeaderMenuButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [clientCategories, setClientCategories] = React.useState<
    CategoryItem[]
  >([]);
  const pathname = usePathname();

  const handleLinkClick = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Close sheet when route changes (e.g. after main nav or category link click)
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleCategorySectionClick = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Fallback: fetch categories on client when sheet opens and server passed none
  React.useEffect(() => {
    if (!open) return;
    if ((categories?.length ?? 0) > 0) return;
    let cancelled = false;
    fetchCategoriesClient().then((data) => {
      if (!cancelled) setClientCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, categories?.length]);

  const allCategories = React.useMemo(() => {
    const fromServer = categories ?? [];
    if (fromServer.length > 0) return fromServer;
    return clientCategories;
  }, [categories, clientCategories]);

  const visibleCategories = React.useMemo(
    () => (allCategories || []).filter(visibleCategoriesFilter),
    [allCategories]
  );

  const parentList = React.useMemo(
    () => buildParentList(visibleCategories),
    [visibleCategories]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[min(320px,90vw)] max-w-full flex-col border-r bg-background p-0"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-4">
          <SheetTitle className="text-left text-lg font-semibold">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          aria-label="Mobile menu"
        >
          {/* Primary links */}
          <div className="shrink-0 px-2 py-3">
            {links.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted/80'
                  }`}
                  onClick={handleLinkClick}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Shop by Category - a flat list; the catalogue's subcategories are
              fabric notes, not a browsing axis, so they are not surfaced here. */}
          <div className="shrink-0 border-t border-border/80 px-3 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by Category
            </h3>
            {parentList.length > 0 ? (
              <ul className="flex flex-col" role="list">
                {parentList.map((item) => (
                  <li
                    key={item.parentSlug}
                    role="listitem"
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <Link
                      href={item.href}
                      onClick={handleCategorySectionClick}
                      className="flex min-h-[48px] items-center gap-3 py-4 text-base font-semibold text-foreground transition-colors hover:text-primary active:scale-[0.98]"
                      aria-label={`Browse ${item.parent}`}
                    >
                      <span className="min-w-0 flex-1 break-words">{item.parent}</span>
                      <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden />
                    </Link>
                  </li>
                ))}
                <li role="listitem" className="pt-3">
                  <Link
                    href="/shop"
                    onClick={handleCategorySectionClick}
                    className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
                  >
                    Shop all
                    <ChevronRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              </ul>
            ) : (
              <div className="space-y-2 py-4" aria-hidden>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-muted/60"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Wishlist only. The cart went back into the header with its count
              badge, so a second entry here would be the same destination
              twice; the wishlist has no header icon and would otherwise be
              unreachable. */}
          <div className="mt-2 border-t border-border pt-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/wishlist"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HeaderMenuButton;
