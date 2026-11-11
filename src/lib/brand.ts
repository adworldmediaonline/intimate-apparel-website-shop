/**
 * Brand values for this deployment.
 *
 * Source of truth: the brand.config.json at the repo root. `scripts/sync-brand.mjs`
 * copies it into each app - never edit the copy. Never hardcode a brand name,
 * email, domain or colour in a component; read it from here.
 */
import config from '../../brand.config.json';

export const brandConfig = config;

export const identity = config.identity;
export const contact = config.contact;
export const social = config.social;
export const assets = config.assets;
export const theme = config.theme;
export const seo = config.seo;
export const commerce = config.commerce;
export const integrations = config.integrations;

/** The customer-facing brand name. */
export const BRAND_NAME = config.identity.name;
/** The registered legal entity, for legal copy and invoices. */
export const LEGAL_NAME = config.identity.legalName;
export const BRAND_KEY = config.brandKey;
export const BRAND_LOGO_ALT = `${config.identity.name} logo`;
export const SITE_URL = config.identity.url;
export const SITE_DOMAIN = config.identity.domain;

export const CURRENCY = config.commerce.currency;
/** ISO-3166 alpha-2 for the store's home market — the checkout's default country. */
export const COMMERCE_COUNTRY = config.commerce.country;
export const CURRENCY_SYMBOL = config.commerce.currencySymbol;
export const LOCALE = config.commerce.locale;

/** A value still carrying a TODO- placeholder is treated as unset. */
const isSet = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && !value.startsWith('TODO-');

/**
 * Support inbox, or null while it is still a placeholder.
 *
 * Guarded like the phone: an unguarded placeholder rendered as
 * `mailto:TODO-support-email`, which looks like a working link and does nothing
 * when tapped.
 */
export const SUPPORT_EMAIL: string | null = isSet(config.contact.supportEmail)
  ? config.contact.supportEmail
  : null;

/** Support phone, or null while it is still a placeholder. */
export const SUPPORT_PHONE: string | null = isSet(config.contact.supportPhone)
  ? config.contact.supportPhone
  : null;

/** `tel:` href for the support phone, or null when there is no number yet. */
// String(): the config currently has no phone, so TypeScript narrows
// SUPPORT_PHONE to `null` here and would reject a direct `.replace`. This keeps
// compiling whether or not a number is configured.
export const SUPPORT_PHONE_HREF: string | null = SUPPORT_PHONE
  ? `tel:${String(SUPPORT_PHONE).replace(/[^\d+]/g, '')}`
  : null;

/** City the store ships from, or null when no address is set. */
export const ADDRESS_CITY: string | null = isSet(config.contact.address.city)
  ? config.contact.address.city
  : null;
export const ADDRESS_STATE: string | null = isSet(config.contact.address.state)
  ? config.contact.address.state
  : null;

/**
 * Postal address as a single line, or null when there is no real address.
 *
 * `country` alone is not an address — with the street and city blank, joining
 * the parts produced the single word "India" and every block that prints the
 * address rendered it as though it were one. Callers should treat null as
 * "hide the address entirely" rather than printing a partial one.
 */
const ADDRESS_PARTS = [
  config.contact.address.line1,
  config.contact.address.line2,
  config.contact.address.city,
  [config.contact.address.state, config.contact.address.postalCode]
    .filter(isSet)
    .join(' - '),
].filter(isSet);

export const ADDRESS_LINE: string | null = ADDRESS_PARTS.length
  ? [...ADDRESS_PARTS, config.contact.address.country].filter(Boolean).join(', ')
  : null;

/**
 * Social links that have actually been filled in.
 *
 * Every value in brand.config.json's `social` block is null until a profile is
 * added, so TypeScript narrows the JSON's type to `null`. Widening to
 * `string | null` here keeps the filter honest without an unsafe cast.
 */
export const activeSocialLinks: { name: string; url: string }[] = Object.entries(
  config.social as Record<string, string | null>
)
  .filter((entry): entry is [string, string] => isSet(entry[1]))
  .map(([name, url]) => ({ name, url }));

/** Absolute URL for a path, e.g. absoluteUrl('/search') -> https://site/search */
export function absoluteUrl(path = '/'): string {
  const base = String(config.identity.url || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Social profiles that are actually configured, as { name, href } pairs. */
export const socialLinks = activeSocialLinks.map(s => ({ name: s.name, href: s.url }));

export default config;

/** Lowercase currency code, for payment SDKs that expect it (Stripe). */
export const CURRENCY_LOWER = config.commerce.currency.toLowerCase();

/**
 * Default share taken online for a part payment, used until the admin's saved
 * payment settings load. Display only — the server decides what is charged.
 */
export const PARTIAL_PAYMENT_PERCENT: number =
  Number(config.commerce.partialPaymentPercent) || 0;

/**
 * The two halves of a part payment, rounded to whole currency units.
 * `percent` defaults to the brand config; checkout passes the share from the
 * admin's saved payment settings, which is what the server actually charges.
 */
export const splitPartialPayment = (
  total: number,
  percent: number = PARTIAL_PAYMENT_PERCENT
) => {
  const amount = Math.max(0, Number(total) || 0);
  const share = Number(percent);
  const pct = Number.isFinite(share) ? Math.min(99, Math.max(0, share)) : 0;
  const payNow = Math.round((amount * pct) / 100);
  return { payNow, dueOnDelivery: Math.round((amount - payNow) * 100) / 100 };
};

/**
 * Format an amount in the brand's currency and locale.
 * Falls back to "<symbol><amount>" if the runtime lacks the locale data.
 */
export function formatMoney(
  amount: number | string | null | undefined,
  options: { withSymbol?: boolean } = {}
): string {
  const { withSymbol = true } = options;
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(config.commerce.locale, {
      style: withSymbol ? 'currency' : 'decimal',
      currency: config.commerce.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    const fixed = safe.toFixed(2);
    return withSymbol ? `${config.commerce.currencySymbol}${fixed}` : fixed;
  }
}
