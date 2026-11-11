const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

export const getActiveAnnouncements = cache(async () => {
  "use cache";
  // A day, with on-demand busting from the admin. This is awaited by the
  // site-wide header, so a short lifetime here became the revalidate
  // interval of every page on the site.
  cacheLife('days');
  cacheTag('announcements');
  try {
    const response = await fetch(`${API_BASE_URL}/api/announcement/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
});

