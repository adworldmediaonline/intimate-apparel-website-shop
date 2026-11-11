import { unstable_cache } from 'next/cache';

// Types for our data
export interface ImageWithMeta {
  url: string;
  fileName?: string;
  title?: string;
  altText?: string;
  link?: string;
}

export type BannerDisplayScope =
  | 'all'
  | 'parent_only'
  | 'children_only'
  | 'parent_and_children';

export interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  /** Image with metadata (fileName, title, altText) */
  image?: ImageWithMeta;
  /** Category banner for shop page */
  banner?: ImageWithMeta;
  bannerDisplayScope?: BannerDisplayScope;
  bannerDisplayChildren?: string[];
  bannerContentActive?: boolean;
  bannerContentDisplayScope?: BannerDisplayScope;
  bannerContentDisplayChildren?: string[];
  bannerTitle?: string;
  bannerDescription?: string;
  bannerTitleClasses?: string;
  bannerDescriptionClasses?: string;
  /** Per-scope Tailwind classes: parent and children can have different styling */
  bannerContentClassesByScope?: {
    parent?: {
      titleClasses?: string;
      descriptionClasses?: string;
      headingTag?: 'h1' | 'h2' | 'h3';
      productCountClasses?: string;
    } | null;
    children?: Record<
      string,
      {
        titleClasses?: string;
        descriptionClasses?: string;
        headingTag?: 'h1' | 'h2' | 'h3';
        productCountClasses?: string;
      }
    >;
  };
  status?: string;
  products?: unknown[];
  children?: string[];
  /** Category Showcase display config – how child categories are grouped/split into cards */
  showcaseGroups?: Array<{
    children?: string[];
    image?: { url: string; fileName?: string; title?: string; altText?: string };
  }>;
  /** Parent category slug – used for subcategory cards */
  parentCategorySlug?: string;
  /** Comma-separated subcategory slugs – used for shop link */
  subcategorySlug?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Generic fetch wrapper with error handling
async function fetchFromAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// Cached categories fetch - this is the key optimization
export const getCategories = unstable_cache(
  async () => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return [];
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        '/api/category/show'
      );

      // Filter and process categories with safe fallbacks
      const categories = data?.result || [];
      if (!Array.isArray(categories)) {
        return [];
      }

      const filteredCategories = categories.filter(
        category =>
          category &&
          (category.products?.length ?? 0) > 0 &&
          category.status === 'Show'
      );

      return filteredCategories;
    } catch (error) {
      return [];
    }
  },
  ['categories-data'],
  {
    // Was 300: product and shop pages read this, so every product page
    // re-rendered (an ISR write) every 5 minutes. Admin category edits bust
    // the 'categories' tag, so a day is safe.
    revalidate: 86400,
    tags: ['categories'],
  }
);

// Get categories for specific product type
export const getProductTypeCategories = unstable_cache(
  async (type: string) => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return [];
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        `/api/category/show/${type}`
      );
      const categories = data?.result || [];
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      return [];
    }
  },
  ['product-type-categories'],
  {
    revalidate: 300,
    tags: ['categories', 'product-types'],
  }
);

// Get all categories (for admin/management)
export const getAllCategories = unstable_cache(
  async () => {
    // Only return empty array during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return [];
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem[] }>(
        '/api/category/all'
      );
      const categories = data?.result || [];
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      return [];
    }
  },
  ['all-categories'],
  {
    revalidate: 600, // 10 minutes for less critical data
    tags: ['categories', 'admin'],
  }
);

// Get single category by ID
export const getCategoryById = unstable_cache(
  async (id: string) => {
    // Only return null during build/export, not during runtime
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      return null;
    }

    try {
      const data = await fetchFromAPI<{ result: CategoryItem }>(
        `/api/category/get/${id}`
      );
      return data.result || null;
    } catch (error) {
      return null;
    }
  },
  ['category-by-id'],
  {
    revalidate: 300,
    tags: ['categories'],
  }
);

// Utility function to convert labels to slugs (moved from components)
export function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
