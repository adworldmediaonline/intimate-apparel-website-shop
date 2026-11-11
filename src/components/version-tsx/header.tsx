import { cacheLife, cacheTag } from 'next/cache';

import { PRIMARY_LINKS } from '@/appdata/navigation';
import { Suspense } from 'react';

import DesktopNav from './desktop-nav';
import HeaderActions from './header-actions';
import HeaderBrand from './header-brand';
import HeaderMenuButton from './header-menu-button';
import HeaderSearchButton from './header-search-button';
import AnnouncementBar from './announcement-bar';
import { getCategoriesShow } from '@/server/categories';
import { getActiveAnnouncements } from '@/server/announcements';


export default async function HeaderV2() {
  "use cache";
  // Without an explicit lifetime this used Next's default cached profile —
  // a 15-minute revalidate — and because the header renders on every page,
  // that became the revalidate interval of the whole site. Everything it
  // reads (categories, announcements) is busted on demand from the admin.
  cacheLife('days');
  // The tags matter as much as the lifetime: getCategoriesShow() and
  // getActiveAnnouncements() carry their own tags, but this unit caches the
  // rendered header, so without these an admin edit refreshed the data and
  // the page still served the old markup for a day.
  cacheTag('categories', 'announcements');
  // Fetch categories and announcements - cached data
  const categories = await getCategoriesShow();
  const announcements = await getActiveAnnouncements();

  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        {/* Announcement Bar - Above header */}
        {announcements.length > 0 && (
          <AnnouncementBar announcements={announcements} />
        )}

        {/* Main Header */}
        {/* `relative` sits on the full-width header, not on the centred
            container: the search panel anchors to it, and anchoring to the
            container left the gutters either side of it uncovered, so the
            page showed through on both sides of the open search bar. */}
        <header className="relative w-full bg-masthead text-masthead-foreground border-b border-border">
          <div className="container mx-auto px-3 md:px-6">
            {/* Top row */}
            <div className="flex h-16 md:h-28 items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="md:hidden">
                  <HeaderMenuButton
                    links={PRIMARY_LINKS}
                    categories={categories || []}
                  />
                </div>
                <HeaderBrand />
              </div>

              {/* Desktop navigation inline on the same row */}
              {/* DesktopNav uses usePathname() which accesses request-time data
                Even with interleaving pattern, hooks accessing runtime data need Suspense
                Categories are cached, so Suspense fallback rarely shows */}
              <div className="hidden md:block shrink-0">
                <Suspense
                  fallback={
                    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
                      <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                      <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                    </nav>
                  }
                >
                  <DesktopNav categories={categories || []} />
                </Suspense>
              </div>

              {/* Spacer so the actions stay hard right on desktop once the
                  search bar that used to fill this space is gone. */}
              <div className="hidden md:block flex-1" />

              {/* Search and account, the same two on every breakpoint. */}
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <HeaderSearchButton />
                <Suspense
                  fallback={
                    <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted" />
                  }
                >
                  <HeaderActions />
                </Suspense>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
