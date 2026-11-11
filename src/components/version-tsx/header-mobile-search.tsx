'use client';

import { usePathname } from 'next/navigation';

import HeaderSearch from './header-search-new';

/**
 * The mobile search row, hidden on product pages.
 *
 * A shopper on a product page has already found what they came for, and the
 * search bar was pushing the product itself further down a phone screen.
 * Every other page keeps it.
 *
 * This exists as a client component only because the header is a server
 * component and cannot read the current path.
 */
export function HeaderMobileSearch() {
  const pathname = usePathname();
  if (pathname?.startsWith('/product/')) return null;

  return (
    <div className="md:hidden pb-3">
      <HeaderSearch className="w-full" />
    </div>
  );
}

export default HeaderMobileSearch;
