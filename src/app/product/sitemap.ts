import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';
import {
  getProductSitemapPage,
  PRODUCT_SITEMAP_PAGE_SIZE,
} from '@/server/sitemap-data';

const isAbsoluteUrl = (value: string | null | undefined): value is string => {
  if (!value?.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const getLastModified = (value: string | Date | null | undefined): Date | undefined => {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return undefined;

  return date;
};

export async function generateSitemaps() {
  const { meta } = await getProductSitemapPage(1, PRODUCT_SITEMAP_PAGE_SIZE);

  return Array.from({ length: meta.totalPages }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  /** Avoid baking empty XML when build has no API/env; fetch products per request. */
  await connection();

  const id = await props.id;
  const numericId = Number(id);
  const page = Number.isInteger(numericId) && numericId >= 0 ? numericId + 1 : 1;
  const siteUrl = getSiteUrl();
  const { data } = await getProductSitemapPage(page, PRODUCT_SITEMAP_PAGE_SIZE);

  return data.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: getLastModified(product.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
    images: isAbsoluteUrl(product.imageUrl) ? [product.imageUrl] : undefined,
  }));
}
