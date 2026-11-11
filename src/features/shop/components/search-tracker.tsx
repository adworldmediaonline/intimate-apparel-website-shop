'use client';

import { useEffect } from 'react';

import { trackSearchQuery } from '@/lib/search-analytics/track-search';

/**
 * Records a shop search.
 *
 * /shop is rendered entirely on the server — the results, the filters and
 * the cards are all server components — so the client hook that used to do
 * this (`useShopProducts`) never runs on the page where searching happens.
 * That is why `searchqueries` was empty however many searches were made.
 *
 * Renders nothing. `trackSearchQuery` dedupes on keyword + result count, so
 * a re-render or a back-navigation cannot inflate the figures.
 */
export function SearchTracker({
  keyword,
  resultsCount,
}: {
  keyword: string;
  resultsCount: number;
}) {
  useEffect(() => {
    if (!keyword) return;
    trackSearchQuery({ keyword, resultsCount, source: 'shop' });
  }, [keyword, resultsCount]);

  return null;
}

export default SearchTracker;
