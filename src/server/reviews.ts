import { cache } from 'react';
import { API_ENDPOINT } from './api-endpoint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Home-page reviews change rarely; short ISR + tag keeps build static-friendly. */
const FEATURED_REVIEWS_REVALIDATE_SEC = 300;

export interface FeaturedReviewProduct {
  _id?: string;
  title?: string;
  slug?: string;
  sku?: string;
  img?: string;
  image?: { url?: string };
}

export interface FeaturedReview {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  guestName?: string;
  userId?: { name?: string } | null;
  productId?: FeaturedReviewProduct | null;
}

/**
 * Latest 5★ customer reviews for the home-page Reviews Showcase (shuffled
 * server-side for a varied loop). Per-render dedupe via React.cache; invalidate
 * from admin via `revalidateTag('reviews')`.
 */
export const getFeaturedReviews = cache(
  async (limit = 10): Promise<FeaturedReview[]> => {
    if (!API_BASE_URL?.trim()) {
      return [];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINT.FEATURED_REVIEWS}?limit=${safeLimit}`,
        {
          next: {
            revalidate: FEATURED_REVIEWS_REVALIDATE_SEC,
            tags: ['reviews'],
          },
        }
      );

      if (!response.ok) {
        console.error(`Error fetching featured reviews: HTTP ${response.status}`);
        return [];
      }

      const json = await response.json();
      if (!json?.success || !Array.isArray(json?.data)) {
        return [];
      }

      return json.data as FeaturedReview[];
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      return [];
    }
  }
);
