import type { MetadataRoute } from 'next';
import { getAbsoluteUrl } from '@/lib/site-url';

/** Static marketing / legal URLs for the root sitemap.xml (product URLs live under /product/sitemap/). */
export const getMainSitemapEntries = (): MetadataRoute.Sitemap => [
  {
    url: getAbsoluteUrl('/'),
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: getAbsoluteUrl('/shop'),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: getAbsoluteUrl('/about'),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: getAbsoluteUrl('/shipping'),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: getAbsoluteUrl('/returns'),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: getAbsoluteUrl('/privacy-policy'),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: getAbsoluteUrl('/size-guide'),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: getAbsoluteUrl('/faq'),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: getAbsoluteUrl('/terms'),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: getAbsoluteUrl('/contact'),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
];
