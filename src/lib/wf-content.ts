/**
 * Editorial-layout copy and fallbacks.
 *
 * The wireframe pages are built from real catalogue data when the backend is
 * reachable. Everything here is what the page falls back to when it is not, so
 * the storefront always renders a complete page instead of a blank shell.
 *
 * Wording is derived from brand.config.json — nothing store-specific is
 * hardcoded, so both brands read correctly from the same file.
 */
import brandConfig from '../../brand.config.json';
import type { WfProduct } from '@/components/wireframe/wf-product-card';
import type { CollectionTile } from '@/components/wireframe/wf-collections-grid';
import type { WfReview } from '@/components/wireframe/wf-reviews-strip';

const identity = brandConfig.identity;
const commerce = brandConfig.commerce;

export const wfHero = {
  eyebrow: identity.tagline,
  title: identity.name,
  body: identity.description,
  primaryCta: { label: 'Shop the Collection', href: '/shop' },
  secondaryCta: { label: 'Our Story', href: '#story' },
};

export const wfRibbon = {
  lead: identity.tagline,
  // Just the origin. The legal name (AV Fashion) was appended here and read
  // as a second brand on the home page — it belongs on the invoice and in
  // the footer's copyright line, not under the hero.
  sub: commerce.country === 'IN' ? 'Made in India' : identity.legalName,
};

export const wfEditorial = {
  eyebrow: 'Our craft',
  title: `Made with care,<br />built to last.`,
  paragraphs: [
    identity.description,
    `Every order is packed and dispatched by ${identity.legalName}, with a GST invoice included.`,
  ],
  link: { label: 'Read our story', href: '/about' },
};

export const wfCampaign = {
  eyebrow: 'This season',
  title: 'Stock up and save',
  body: 'Our most-ordered essentials, bundled for households and businesses alike.',
  cta: { label: 'Shop the range', href: '/shop' },
};

export const wfStats = [
  { num: '100%', label: 'Quality Checked' },
  { num: '4.8★', label: 'Avg. Rating' },
  { num: '24h', label: 'Dispatch' },
  // Discreet packaging is the promise that matters most for this catalogue,
  // so it takes the slot the GST line used to hold. The same claim is made by
  // the trust strip on the product page, with the same wording.
  { num: 'Discreet', label: 'Packaging' },
];

/** Shown only until real reviews exist in the database. */
export const wfFallbackReviews: WfReview[] = [];

export const wfMediaNames: string[] = [];

/**
 * Category tiles fall back to whatever the catalogue exposes; when nothing is
 * available we render nothing rather than inventing collections that
 * do not exist.
 */
export const wfFallbackTiles: CollectionTile[] = [];

export const wfFallbackProducts: WfProduct[] = [];

/**
 * The secondary reassurances, shown below Buy It Now.
 *
 * Discreet packaging, returns and dispatch speed deliberately are NOT here:
 * they moved into the trust strip that sits directly above Add to Cart, where
 * they are read at the moment of the decision rather than after it. Listing
 * them in both places said the same thing twice on one screen.
 */
export const wfAssurances = [
  { icon: '✅', text: 'Quality checked before dispatch' },
  // GST is table stakes and said already on the price line ("inclusive of
  // all taxes"); how fast it leaves is the thing a buyer weighs.
  { icon: '🚚', text: 'Dispatched within 24 hours' },
];
