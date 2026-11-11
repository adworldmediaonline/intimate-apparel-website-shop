import Providers from '@/components/provider';
import { Analytics } from '@vercel/analytics/next';

import { Toaster } from '@/components/ui/sonner';
import Wrapper from '@/components/wrapper';
import { GoogleTagManager } from '@next/third-parties/google';
import { Fraunces, Lato } from 'next/font/google';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';

import BrandTheme from '@/components/wireframe/brand-theme';
// import WfAgeGate from '@/components/wireframe/wf-age-gate';
import FooterGate from '../components/version-tsx/footer-gate';
import HeaderWrapper from '../components/version-tsx/header-wrapper';
import './globals.css';
import '../styles/wireframe.css';

import brand, { absoluteUrl, integrations, socialLinks } from '@/lib/brand';

// Third-party analytics are opt-in per store. Nothing loads until this store
// supplies its own IDs, so a copied storefront can never report page views or
// conversions into the account of the brand it was copied from.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || integrations.gtmId?.trim();

export const metadata = {
  title: brand.seo.title,
  description: brand.seo.description,
  keywords: brand.seo.keywords,

  metadataBase: new URL(brand.identity.url),
  alternates: {
    canonical: '/',
  },
  // The generated icon set. Without these declared, only the .ico in app/
  // was ever served — phones adding the site to a home screen fell back to
  // a screenshot instead of the brand mark.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  // Only emit the verification tag once this store has its own Search Console
  // property. Inheriting another site's token verifies the wrong property.
  ...(brand.seo.googleVerification.length
    ? { verification: { google: brand.seo.googleVerification } }
    : {}),
};

const GLOBAL_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.identity.name,
    url: absoluteUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.identity.name,
    legalName: brand.identity.legalName,
    url: absoluteUrl('/'),
    logo: absoluteUrl(brand.assets.logo),
    description: brand.identity.description,
    // Only real, configured profiles — a sameAs pointing at a handle that does
    // not exist is worse for SEO than omitting it.
    ...(socialLinks.length ? { sameAs: socialLinks.map(s => s.href) } : {}),
  },
];

const lato = Lato({
  variable: '--font-lato',
  weight: ['300', '400', '700'], // Reduced from 5 weights to 3 essential weights
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true, // Preload primary font for faster rendering
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * Seasonal site theme — Memorial Day 2026 (campaign 2026-05-22 → 2026-05-26).
 * The matching CSS overrides live in `globals.css` under
 * `html[data-theme='memorial']`.
 *
 * TODO: Memorial Day cleanup — after 2026-05-26, set `activeTheme` to `null`
 * to return the site to its normal theme.
 *
 * Hard-coded on purpose: calling `new Date()` in this Server Component breaks
 * Next.js static prerendering (next-prerender-current-time), so the previous
 * date-window auto-activation was removed.
 */
// TODO: set to a campaign theme name when running a seasonal promo.
const activeTheme = null;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      {...(activeTheme ? { 'data-theme': activeTheme } : {})}
    >
      <head>
        {/* Preconnect to image CDNs for faster LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://i.ibb.co" />

        {/* DNS prefetch, only for the scripts this store actually loads */}
        {META_PIXEL_ID && (
          <link rel="dns-prefetch" href="https://connect.facebook.net" />
        )}
        {GTM_ID && <link rel="dns-prefetch" href="https://www.googletagmanager.com" />}
      </head>
      <body
        className={`${lato.variable} ${fraunces.variable} ${lato.className} antialiased flex min-h-screen flex-col`}
        suppressHydrationWarning
      >
        {/* No manual GTM noscript here: <GoogleTagManager> from
            @next/third-parties renders its own, and having both put two
            ns.html iframes in the page. Harmless with JS on — noscript does
            not execute — but a no-JS visitor loaded the container twice. */}


        <BrandTheme />
        {/* Age confirmation popup disabled. Re-enable by uncommenting. */}
        {/* <WfAgeGate /> */}
        <Providers>
          <Suspense fallback={null}>
            <Wrapper>
              <div className="flex flex-col min-h-screen">
                <HeaderWrapper />
                <main className="grow">
                  <NuqsAdapter>{children}</NuqsAdapter>
                </main>
                {/* Hidden on the checkout steps — see FooterGate. */}
                <FooterGate />
              </div>
            </Wrapper>
          </Suspense>
        </Providers>

        <Toaster richColors />

        {META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
        <Analytics />


        <Script
          id="global-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(GLOBAL_SCHEMA).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  );
}
