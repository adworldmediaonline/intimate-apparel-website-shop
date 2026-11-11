'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { swatchForColour } from '@/lib/colour-swatch';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';

export interface FilterCategory { label: string; href: string; count?: number; active?: boolean }
export interface FilterOption { label: string; count?: number }
export interface FilterColour {
  label: string;
  href: string;
  count?: number;
  active?: boolean;
}

export interface WfFilterSidebarProps {
  categories?: FilterCategory[];
  colours?: FilterColour[];
  facets?: { heading: string; options: FilterOption[] }[];
  priceRange?: { min: number; max: number };
  open?: boolean;
}

export function WfFilterSidebar({
  categories = [],
  colours = [],
  facets = [],
  priceRange,
  open = false,
}: WfFilterSidebarProps) {
  const { navigate, isPending, pendingHref } = useFilterNavigation();
  const [min, setMin] = useState(priceRange?.min ?? 0);
  const [max, setMax] = useState(priceRange?.max ?? 0);
  const [isOpen, setIsOpen] = useState(open);

  /**
   * Navigate, and on mobile close the drawer at the same time. The panel covers
   * the whole page there, so leaving it open while the grid re-renders behind it
   * made a filter tap look like it had done nothing.
   */
  const go = (href: string, event: React.MouseEvent) => {
    navigate(href, event);
    setIsOpen(false);
  };

  useEffect(() => {
    const openFilters = () => setIsOpen(true);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('wf-open-filters', openFilters);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('wf-open-filters', openFilters);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={`wf-filter-backdrop${isOpen ? ' open' : ''}`}
        aria-label="Close filters"
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`wf-filters${isOpen ? ' open' : ''}${isPending ? ' pending' : ''}`}
        id="wf-filters"
        aria-busy={isPending}
      >
        <button
          type="button"
          className="wf-filter-close"
          aria-label="Close filters"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      {categories.length > 0 && (
        <div className="wf-filter-group">
          <h4>Shop by Category</h4>
          <div className="wf-filter-cat-list">
            {categories.map(c => (
              <Link
                href={c.href}
                key={c.label}
                onClick={e => go(c.href, e)}
                aria-current={c.active ? 'true' : undefined}
                aria-busy={pendingHref === c.href}
                className={[c.active ? 'on' : '', pendingHref === c.href ? 'busy' : '']
                  .filter(Boolean)
                  .join(' ') || undefined}
              >
                {c.label}
                {typeof c.count === 'number' ? ` (${c.count})` : ''}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Colour is multi-select: each entry toggles itself in the `color`
          query param, so filtering happens server-side and a filtered shop
          stays a shareable URL. Category, above, is single-select. */}
      {colours.length > 0 && (
        <div className="wf-filter-group">
          <h4>
            Colour <span>−</span>
          </h4>
          <div className="wf-colour-list">
            {colours.map(c => (
              <Link
                href={c.href}
                key={c.label}
                onClick={e => go(c.href, e)}
                aria-pressed={c.active}
                aria-busy={pendingHref === c.href}
                className={`wf-colour-opt${c.active ? ' on' : ''}${
                  pendingHref === c.href ? ' busy' : ''
                }`}
                scroll={false}
              >
                {/* A real box, because colour is multi-select and the dot
                    alone gave no hint that these stack. Presentational: the
                    link is what carries the state, and aria-pressed above
                    already announces it. */}
                <span className="wf-colour-check" aria-hidden="true">
                  {c.active && (
                    <svg viewBox="0 0 12 10" width="10" height="9" focusable="false">
                      <path
                        d="M1 5l3.2 3.2L11 1.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className="wf-colour-dot"
                  style={swatchForColour(c.label)}
                  aria-hidden="true"
                />
                <span className="wf-colour-name">{c.label}</span>
                {typeof c.count === 'number' && <span className="n">{c.count}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {facets.map(f => (
        <div className="wf-filter-group" key={f.heading}>
          <h4>
            {f.heading} <span>−</span>
          </h4>
          {f.options.map(o => (
            <label className="wf-filter-opt" key={o.label}>
              <input type="checkbox" />
              {o.label}
              {typeof o.count === 'number' && <span className="n">{o.count}</span>}
            </label>
          ))}
        </div>
      ))}

      {priceRange && (
        <div className="wf-filter-group">
          <h4>
            Price <span>−</span>
          </h4>
          <div className="wf-price-inputs">
            <input
              value={`${CURRENCY_SYMBOL}${min}`}
              onChange={e => setMin(Number(e.target.value.replace(/\D/g, '')) || 0)}
              aria-label="Minimum price"
            />
            <span>–</span>
            <input
              value={`${CURRENCY_SYMBOL}${max}`}
              onChange={e => setMax(Number(e.target.value.replace(/\D/g, '')) || 0)}
              aria-label="Maximum price"
            />
          </div>
        </div>
      )}
      </aside>
    </>
  );
}

export default WfFilterSidebar;
