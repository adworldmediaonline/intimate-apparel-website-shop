import { z } from 'zod';

/**
 * Prefer a server-only base URL on Vercel (`NEXT_PUBLIC_*` may be wrong during
 * CI/build or unreachable from lambdas without a stable origin).
 */
export const resolveSitemapApiBaseUrl = (): string | undefined => {
  const serverOnly =
    process.env.SITEMAP_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_URL?.trim();

  const publicFallback = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  return serverOnly || publicFallback || undefined;
};

export const PRODUCT_SITEMAP_PAGE_SIZE = 50000;

const productSitemapItemSchema = z.object({
  slug: z.string().min(1),
  updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

const productSitemapMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(PRODUCT_SITEMAP_PAGE_SIZE),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

const productSitemapResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productSitemapItemSchema),
  meta: productSitemapMetaSchema,
});

export interface ProductSitemapItem {
  slug: string;
  updatedAt?: string | Date | null;
  imageUrl?: string | null;
}

export interface ProductSitemapMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductSitemapPage {
  data: ProductSitemapItem[];
  meta: ProductSitemapMeta;
}

const emptyProductSitemapPage = (
  page: number,
  limit: number
): ProductSitemapPage => ({
  data: [],
  meta: {
    page,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  },
});

export const getProductSitemapPage = async (
  page: number,
  limit = PRODUCT_SITEMAP_PAGE_SIZE
): Promise<ProductSitemapPage> => {
  const apiBaseUrl = resolveSitemapApiBaseUrl();

  if (!apiBaseUrl?.trim()) return emptyProductSitemapPage(page, limit);

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, '')}/api/sitemap/products?${searchParams.toString()}`,
      {
        // Request-time fetch for sitemap/robots Route Handlers on Vercel.
        cache: 'no-store',
      }
    );

    if (!response.ok) return emptyProductSitemapPage(page, limit);

    const json: unknown = await response.json();
    const parsed = productSitemapResponseSchema.safeParse(json);

    if (!parsed.success) return emptyProductSitemapPage(page, limit);

    return parsed.data;
  } catch {
    return emptyProductSitemapPage(page, limit);
  }
};
