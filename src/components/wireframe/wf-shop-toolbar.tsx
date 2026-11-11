'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { DEFAULT_SHOP_SORT, SHOP_SORTS } from '@/lib/shop-sort';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';

export function WfShopToolbar({
  count,
  activeFilters = [],
}: {
  count: number;
  activeFilters?: { label: string; href: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigate, isPending, pendingHref } = useFilterNavigation();
  const current = searchParams.get('sort') ?? DEFAULT_SHOP_SORT.key;

  /**
   * Sorting is a URL change, not local state: the products are rendered on the
   * server, so the page has to be re-requested for a new order — and a sorted
   * shop stays shareable and survives a refresh. Other filters are preserved;
   * the page number is not, since page 4 of one ordering means nothing in
   * another.
   */
  const handleSort = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === DEFAULT_SHOP_SORT.key) {
      params.delete('sort');
    } else {
      params.set('sort', key);
    }
    params.delete('page');
    const query = params.toString();
    router.push(query ? `/shop?${query}` : '/shop');
  };

  return (
    <>
      <div className="wf-shop-toolbar">
        <span className="count">{count} product{count === 1 ? '' : 's'}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="wf-btn wf-btn-outline wf-filter-toggle"
            style={{ padding: '9px 18px' }}
            aria-controls="wf-filters"
            onClick={() => window.dispatchEvent(new Event('wf-open-filters'))}
          >
            Filters
          </button>
          <select
            aria-label="Sort products"
            value={current}
            onChange={event => handleSort(event.target.value)}
          >
            {SHOP_SORTS.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="wf-active-filters" aria-busy={isPending}>
          {activeFilters.map(filter => (
            <Link
              className={`wf-chip${pendingHref === filter.href ? ' busy' : ''}`}
              href={filter.href}
              key={filter.label}
              onClick={e => navigate(filter.href, e)}
              aria-busy={pendingHref === filter.href}
            >
              {filter.label} <b aria-hidden>×</b>
            </Link>
          ))}
          <Link
            href="/shop"
            className={`wf-clear-all${pendingHref === '/shop' ? ' busy' : ''}`}
            onClick={e => navigate('/shop', e)}
            aria-busy={pendingHref === '/shop'}
          >
            {pendingHref === '/shop' ? 'Clearing…' : 'Clear all'}
          </Link>
        </div>
      )}
    </>
  );
}

export default WfShopToolbar;
