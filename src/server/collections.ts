const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

export type Collection = {
  /** Also the URL: /shop?collection=<key> */
  key: string;
  title: string;
  tagline: string;
  linkLabel: string;
  image: string;
  icon: string;
  productCount: number;
};

/**
 * The Shop by Collection tiles.
 *
 * Returns an empty list on any failure, and the home page then draws no
 * section at all — an unreachable backend should cost the page one block,
 * not the whole render.
 */
export const getCollections = cache(async (): Promise<Collection[]> => {
  'use cache';
  cacheLife('days');
  cacheTag('home-rows');
  try {
    const response = await fetch(`${API_BASE_URL}/api/home-rows/collections`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    const body = await response.json();
    return Array.isArray(body?.data) ? (body.data as Collection[]) : [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
});

/** One collection by key, for the shop page's heading and crumb. */
export const getCollection = cache(
  async (key: string): Promise<Collection | null> => {
    if (!key) return null;
    const all = await getCollections();
    return all.find(c => c.key === key) ?? null;
  }
);
