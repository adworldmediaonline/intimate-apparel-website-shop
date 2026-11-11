import { NextResponse } from 'next/server';
import { getMainSitemapEntries } from '@/lib/main-sitemap-entries';
import { serializeUrlsetXml } from '@/lib/serialize-main-sitemap-xml';

/** Served at `/sitemap.xml` via `rewrites()` (same rationale as `/robots` route). */
export const GET = async () => {
  const xml = serializeUrlsetXml(getMainSitemapEntries());

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
