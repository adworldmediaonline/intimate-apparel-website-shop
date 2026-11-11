import type { MetadataRoute } from 'next';

/** Minimal XML escaping for sitemap <loc> values. */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Build sitemaps.org XML for a small static urlset.
 * Product sitemaps use Next metadata at /product/sitemap/*.xml.
 */
export const serializeUrlsetXml = (entries: MetadataRoute.Sitemap): string => {
  const body = entries
    .map((entry) => {
      const loc = escapeXml(entry.url);
      const parts = [`    <loc>${loc}</loc>`];

      if (entry.lastModified != null) {
        const d =
          entry.lastModified instanceof Date
            ? entry.lastModified.toISOString()
            : String(entry.lastModified);
        parts.push(`    <lastmod>${escapeXml(d)}</lastmod>`);
      }

      if (entry.changeFrequency) {
        parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      }

      if (entry.priority != null) {
        parts.push(`    <priority>${entry.priority}</priority>`);
      }

      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
};
