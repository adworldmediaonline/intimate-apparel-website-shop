const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

export type HomeRow = {
  enabled: boolean;
  limit: number;
  /** False when nobody has picked products, so the page falls back. */
  curated: boolean;
  products: Record<string, unknown>[];
};

export type HomeRows = {
  bestsellers?: HomeRow;
  'new-arrivals'?: HomeRow;
};

/**
 * The hand-picked home rows.
 *
 * Returns an empty object on any failure, which the page reads as "not
 * curated" and falls back to the catalogue — a row the admin has not
 * touched, or an unreachable backend, both leave the home page as it was.
 */
export const getHomeRows = cache(async (): Promise<HomeRows> => {
  'use cache';
  cacheLife('days');
  cacheTag('home-rows');
  try {
    const response = await fetch(`${API_BASE_URL}/api/home-rows`);
    if (!response.ok) throw new Error('Failed to fetch home rows');
    const body = await response.json();
    return (body?.data ?? {}) as HomeRows;
  } catch (error) {
    console.error('Error fetching home rows:', error);
    return {};
  }
});
