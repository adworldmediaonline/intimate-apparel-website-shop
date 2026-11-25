/**
 * Server-side GTM tagging server, proxied first-party (see gtm-server/README.md).
 *
 * Inert until GTM_SERVER_URL is set - with no value the rewrite is not added.
 *
 * The `/metrics` prefix is FORWARDED, not stripped. Google's reference
 * same-origin setup routes `/metrics/*` with no path rewrite, and the tagging
 * server is written for that: it matches `/healthy` with `endsWith` and preview
 * traffic with `indexOf("/gtm/debug/")`, so the prefix is expected to arrive.
 * The wildcard also covers `/metrics/_/*`, which Google says must reach the
 * server container or core functionality breaks.
 */
const GTM_SERVER_URL = process.env.GTM_SERVER_URL?.trim().replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Public SEO URLs avoid reserved segment names like `robots.txt/` / `sitemap.xml/` folders. */
  async rewrites() {
    return [
      { source: '/robots.txt', destination: '/robots' },
      { source: '/sitemap.xml', destination: '/sitemap' },
      ...(GTM_SERVER_URL
        ? [{ source: '/metrics/:path*', destination: `${GTM_SERVER_URL}/metrics/:path*` }]
        : []),
    ];
  },

  /** No redirects yet. Add this store's own legacy-URL redirects here. */
  async redirects() {
    return [];
  },

  /**
   * Keep the Vercel deployment URLs out of Google.
   *
   * Every deployment is reachable at a `*.vercel.app` host as well as at
   * shop.unwrapher.com, serving the same pages. Vercel marks *preview* deployments
   * noindex, but the production one is left alone, so its `.vercel.app`
   * address gets crawled and indexed as a duplicate of the real site. The
   * canonical tags point home, but a canonical is a hint and Google indexes
   * these anyway once anything links to them.
   *
   * `noindex` is sent as a header rather than a robots.txt Disallow on
   * purpose: a blocked URL is one Google may never fetch again, so it would
   * never see the instruction and the stale entry would sit in the index.
   * Previews stay usable for the team — people can still open them, only
   * search engines are told to drop them.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },


  cacheComponents: true,
  reactCompiler: true,

  images: {
    // Prioritize modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
