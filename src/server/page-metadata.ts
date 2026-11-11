'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { API_ENDPOINT } from './api-endpoint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PageMetadata {
  _id?: string;
  slug: string;
  displayName?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  isActive?: boolean;
}

export async function getPageMetadata(slug: string): Promise<PageMetadata | null> {
  cacheLife('weeks');
  cacheTag('cms', 'page-metadata');

  if (!API_BASE_URL || !slug?.trim()) return null;

  try {
    const normalizedSlug = slug.toLowerCase().trim();
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PAGE_METADATA}/${normalizedSlug}`,
    );

    if (!response.ok) return null;

    const json = await response.json();
    if (!json?.success || !json?.data) return null;

    return json.data as PageMetadata;
  } catch (error) {
    console.error('Error fetching page metadata:', error);
    return null;
  }
}
