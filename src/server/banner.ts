const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cache } from 'react';
import { API_ENDPOINT } from './api-endpoint';

/**
 * Homepage carousel banners — `cache: 'no-store'` is rejected mid-prerender during PPR/Cache Components
 * ("HANGING_PROMISE_REJECTION"). Use short ISR + tags instead; invalidate from admin via `revalidateTag('banners')`.
 *
 * Seconds-scale freshness without breaking `next build` static generation.
 */
// A day, not 30 seconds. Banners sit on the home page, so this window was
// the home page's revalidate interval — the most-requested route on the
// site, regenerating twice a minute. Banner saves in the admin call
// revalidateTag('banners'), so an edit still appears immediately.
const BANNERS_FETCH_REVALIDATE_SEC = 86400;

/** Per-render dedupe only (React.cache). */
export const getActiveBanners = cache(async () => {
  if (!API_BASE_URL?.trim()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.BANNER}`, {
      next: {
        revalidate: BANNERS_FETCH_REVALIDATE_SEC,
        tags: ['banners'],
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching banner: HTTP ${response.status}`,
        await response.text().catch(() => '')
      );
      return [];
    }

    const data = await response.json();
    if (!data?.data) {
      console.error('Error fetching banner: Missing data payload');
      return [];
    }

    return data?.data ?? [];
  } catch (error) {
    console.error('Error fetching banner:', error);
    return [];
  }
});
