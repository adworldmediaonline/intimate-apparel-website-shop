const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { API_ENDPOINT } from './api-endpoint';

export const getCategoriesShow = cache(async () => {
  "use cache";
  // 'hours', not 'minutes'. The site-wide header is itself a cached component
  // and awaits this, so whatever lifetime is set here becomes the revalidate
  // interval of every page on the site. At 'minutes' that was one ISR write per
  // page per minute — about 2.8M writes a month, for a category list that
  // changes a few times a year. `cacheTag` lets the admin bust it on demand.
  cacheLife('days');
  cacheTag('categories');
  if (!API_BASE_URL?.trim()) {
    console.error('NEXT_PUBLIC_API_BASE_URL is not set');
    return [];
  }
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.CATEGORIES}`, {
      next: { revalidate: 86400, tags: ['categories'] },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    if (!data?.result) {
      throw new Error('No categories found');
    }
    return data?.result || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});
