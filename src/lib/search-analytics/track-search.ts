import { getOrCreateShopCartIntentSessionKey } from '@/lib/shop-cart-intent/session-key';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  '';

export interface TrackSearchInput {
  keyword: string;
  resultsCount?: number | null;
  userId?: string | null;
  userEmail?: string | null;
  source?: string;
}

// In-memory guard so the same committed search isn't posted repeatedly within a
// page session (e.g. re-renders, pagination, revisiting the same term).
const sentKeys = new Set<string>();

/**
 * Fire-and-forget: record a visitor search on the backend without blocking the UI.
 * Safe to call from render effects — it never throws and never awaits in the caller.
 */
export const trackSearchQuery = (input: TrackSearchInput): void => {
  try {
    if (typeof window === 'undefined') return;

    const keyword = String(input.keyword || '').trim();
    if (!keyword || !API_BASE_URL) return;

    // Dedupe per (keyword + results) so we count distinct committed searches, not renders.
    const dedupeKey = `${keyword.toLowerCase()}::${input.resultsCount ?? ''}`;
    if (sentKeys.has(dedupeKey)) return;
    sentKeys.add(dedupeKey);

    const body = JSON.stringify({
      keyword,
      resultsCount:
        typeof input.resultsCount === 'number' ? input.resultsCount : undefined,
      userId: input.userId || undefined,
      userEmail: input.userEmail || undefined,
      sessionId: getOrCreateShopCartIntentSessionKey(),
      source: input.source || 'shop',
    });

    // keepalive lets the request complete even if the user navigates away.
    void fetch(`${API_BASE_URL}/api/search-analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'include',
    }).catch(() => {
      // Ignore — tracking must never surface an error to the visitor.
    });
  } catch {
    // Never throw from tracking.
  }
};
