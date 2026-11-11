import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';
import {
  getProductSitemapPage,
  PRODUCT_SITEMAP_PAGE_SIZE,
} from '@/server/sitemap-data';

/**
 * Served at `/robots.txt` via `rewrites()` in next.config.js.
 * Do not use a `robots.txt/` segment folder: Next resolves it as robots metadata and
 * looks for `robots.ts`, which breaks dev (MODULE_NOT_FOUND / handler errors).
 */
const DISALLOW_PATHS = [
  '/sign-in',
  '/sign-up',
  '/login',
  '/register',
  '/profile',
  '/cart',
  '/checkout',
  '/confirmation',
  '/track-order',
  '/wishlist',
  '/compare',
  '/coupon',
  '/forgot',
  '/email-verify',
  '/forget-password',
  '/admin/',
  '/search',
  '/dashboard/',
  '/webhook/',
  '/contact/thank-you',
  // Sort/colour/search combinations of /shop are near-infinite for a crawler
  // and each one is a server render. Category pages stay crawlable.
  '/*?*sort=',
  '/*?*color=',
  '/*?*search=',
];

export const GET = async () => {
  const siteUrl = getSiteUrl();
  const { meta } = await getProductSitemapPage(1, PRODUCT_SITEMAP_PAGE_SIZE);
  const productSitemapUrls = Array.from(
    { length: meta.totalPages },
    (_, id) => `${siteUrl}/product/sitemap/${id}.xml`
  );

  // One group for everyone. A separate `Googlebot` group made Google ignore
  // every Disallow below, since a crawler obeys only its most specific group.
  const lines: string[] = [
    'User-agent: *',
    'Allow: /',
  ];
  for (const path of DISALLOW_PATHS) {
    lines.push(`Disallow: ${path}`);
  }

  lines.push('');
  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  for (const url of productSitemapUrls) {
    lines.push(`Sitemap: ${url}`);
  }

  const body = `${lines.join('\n')}\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
