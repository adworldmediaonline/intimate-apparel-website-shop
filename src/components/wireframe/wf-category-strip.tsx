'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export interface CategoryStripItem {
  label: string;
  href: string;
  slug: string;
}

/**
 * Horizontal category bar that sticks under the site header.
 *
 * On a product page the header is the only navigation in reach; getting back to
 * a sibling category otherwise means opening the menu or going back twice. This
 * keeps the whole category list one tap away while the page scrolls.
 *
 * It scrolls horizontally rather than wrapping, so the bar stays one line tall
 * on a phone no matter how many categories the store has. The active category is
 * scrolled into view on mount — with seven categories the current one is often
 * off-screen to the right when the strip first paints.
 */
export function WfCategoryStrip({
  items,
  activeSlug,
}: {
  items: CategoryStripItem[];
  activeSlug?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const active = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const box = scroller.current;
    const pill = active.current;
    if (!box || !pill) return;
    // Centre the active pill without scrolling the page itself, which
    // `scrollIntoView` would do on a sticky element.
    box.scrollLeft = pill.offsetLeft - box.clientWidth / 2 + pill.clientWidth / 2;
  }, [activeSlug]);

  if (!items.length) return null;

  return (
    <nav className="wf-cat-strip" aria-label="Shop categories">
      <div className="wf-cat-strip-scroll" ref={scroller}>
        {items.map(item => {
          const isActive = item.slug === activeSlug;
          return (
            <Link
              key={item.slug}
              href={item.href}
              ref={isActive ? active : undefined}
              className={`wf-cat-pill${isActive ? ' on' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default WfCategoryStrip;
