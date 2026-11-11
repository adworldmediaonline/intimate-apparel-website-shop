/**
 * GA4 ecommerce events, pushed to the GTM dataLayer.
 *
 * The container was on every page but nothing ever pushed to it, so the only
 * thing it ever saw was its own automatic pageview — no conversions, no
 * revenue, nothing for ads to optimise against. These helpers emit the GA4
 * recommended-event shape, which is what both GA4 and a server-side tagging
 * container expect, so this works whether or not sGTM is in front of it.
 *
 * Everything here is defensive by design: analytics must never be able to
 * break a page. Each call is wrapped, and a missing dataLayer (GTM blocked, ad
 * blocker, server render) is a silent no-op rather than a thrown error.
 */
import { CURRENCY } from '@/lib/brand';

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

const money = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * One event onto the dataLayer.
 *
 * `ecommerce: null` is pushed first on purpose. GTM's dataLayer merges rather
 * than replaces, so without it the previous event's `items` array lingers and
 * the next event reports the wrong products — the classic duplicated-item bug.
 */
/**
 * Fields Meta's tag reads, also published at the top level of the dataLayer.
 *
 * GA4 expects everything nested under `ecommerce`; Meta's Conversions API tag
 * template is usually configured against flat keys (`value`, `currency`,
 * `contents`). A Data Layer Variable set to `value` cannot see
 * `ecommerce.value`, which is why the Meta tag fired and succeeded while
 * every custom-data field came through empty.
 *
 * Publishing both costs a few hundred bytes and makes the tag work whichever
 * way its variables are pointed, instead of depending on container config
 * being exactly right.
 */
const META_FLAT_KEYS = [
  'event_id',
  'value',
  'currency',
  'transaction_id',
  'contents',
  'content_ids',
  'content_type',
  'user_data',
  'num_items',
] as const;

const flatForMeta = (ecommerce: Record<string, unknown>) => {
  const flat: Record<string, unknown> = {};
  for (const key of META_FLAT_KEYS) {
    if (ecommerce[key] !== undefined) flat[key] = ecommerce[key];
  }
  return flat;
};

/** Every flat key cleared, so one event's data cannot leak into the next. */
const clearedFlat = () =>
  Object.fromEntries(META_FLAT_KEYS.map(key => [key, undefined]));

function push(event: string, ecommerce: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    const payload = withMetaFields(ecommerce);
    // The dataLayer merges rather than replaces, so the previous event's
    // values have to be cleared explicitly — both the nested block and the
    // flat copies.
    w.dataLayer.push({ ecommerce: null, ...clearedFlat() });
    w.dataLayer.push({ event, ecommerce: payload, ...flatForMeta(payload) });
  } catch {
    // Analytics is never worth breaking a page over.
  }
}

/**
 * Add the field names Meta's Conversions API tag reads.
 *
 * GA4 and Meta describe the same basket differently: GA4 wants `items` with
 * `item_id`/`price`, Meta wants `contents` with `id`/`item_price` plus a flat
 * `content_ids`. A Meta CAPI tag pointed at the GA4 array reads `undefined`,
 * which is what the Custom_Data_Items variable was showing. Emitting both
 * costs a few bytes and lets either tag read natively, with no mapping
 * variables in the container.
 */
function withMetaFields(ecommerce: Record<string, unknown>): Record<string, unknown> {
  const items = ecommerce.items as AnalyticsItem[] | undefined;
  if (!Array.isArray(items) || items.length === 0) return ecommerce;
  return {
    ...ecommerce,
    content_type: 'product',
    content_ids: items.map(i => i.item_id),
    contents: items.map(i => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
  };
}

/** A cart line or product document reduced to the GA4 item shape. */
export function toAnalyticsItem(
  product: Record<string, any>,
  quantity = 1
): AnalyticsItem {
  const variant = product.selectedConfigurations
    ? Object.values(product.selectedConfigurations as Record<string, { option?: { name?: string } }>)
        .map(entry => entry?.option?.name)
        .filter(Boolean)
        .join(' / ')
    : undefined;

  return {
    item_id: String(product.sku || product._id || ''),
    item_name: String(product.title || ''),
    item_brand: product.brand || undefined,
    item_category: product.category?.name || product.parent || undefined,
    ...(variant ? { item_variant: variant } : {}),
    price: money(product.finalPriceDiscount ?? product.price),
    quantity: Number(product.orderQuantity ?? quantity) || 1,
  };
}

const sumValue = (items: AnalyticsItem[]) =>
  money(items.reduce((total, i) => total + i.price * i.quantity, 0));

export function trackViewItem(item: AnalyticsItem): void {
  push('view_item', { currency: CURRENCY, value: money(item.price), items: [item] });
}

export function trackAddToCart(item: AnalyticsItem): void {
  push('add_to_cart', {
    currency: CURRENCY,
    value: money(item.price * item.quantity),
    items: [item],
  });
}

export function trackBeginCheckout(
  items: AnalyticsItem[],
  value?: number,
  customer?: CustomerInfo
): void {
  push('begin_checkout', {
    currency: CURRENCY,
    value: value != null ? money(value) : sumValue(items),
    items,
    ...userDataBlock(customer),
  });
}

export function trackAddPaymentInfo(
  items: AnalyticsItem[],
  paymentType: string,
  value?: number,
  customer?: CustomerInfo
): void {
  push('add_payment_info', {
    currency: CURRENCY,
    value: value != null ? money(value) : sumValue(items),
    payment_type: paymentType,
    items,
    ...userDataBlock(customer),
  });
}

/**
 * Customer details for Meta advanced matching / CAPI.
 *
 * Meta matches a conversion to a person using these, and match quality drives
 * attribution — without them a purchase is reported but barely attributable.
 * Sent in the clear to the dataLayer and hashed by the Meta tag template
 * itself, which is how the template expects to receive them; nothing here is
 * written to logs or to any third party other than that tag.
 */
export interface CustomerInfo {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

const cleanUserData = (c: CustomerInfo): Record<string, string> => {
  const out: Record<string, string> = {};
  const put = (key: string, value?: string) => {
    const v = String(value ?? '').trim();
    if (v) out[key] = v.toLowerCase();
  };
  put('email', c.email);
  put('phone', c.phone);
  put('first_name', c.firstName);
  put('last_name', c.lastName);
  put('city', c.city);
  put('state', c.state);
  put('zip', c.zip);
  put('country', c.country);
  return out;
};

/** `user_data`, omitted entirely when there is nothing worth sending. */
function userDataBlock(customer?: CustomerInfo): Record<string, unknown> {
  if (!customer) return {};
  const userData = cleanUserData(customer);
  return Object.keys(userData).length ? { user_data: userData } : {};
}

export function trackPurchase(order: {
  transactionId: string;
  value: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: AnalyticsItem[];
  customer?: CustomerInfo;
}): void {
  // Deduped here, not only at the call site. A purchase reported twice
  // inflates revenue and ad attribution, and relying on every caller to
  // remember the guard is how that happens. Keyed on the transaction, so a
  // genuinely different order is never blocked.
  if (!oncePerSession(`ga4-purchase-${order.transactionId}`)) return;

  push('purchase', {
    /**
     * Deduplication key shared with the server-side Conversions API.
     *
     * The browser pixel and the server both report this purchase. Meta
     * collapses them into one only when event_name and event_id match; with
     * no event_id it counts the sale twice, which doubles reported revenue
     * and misleads ad optimisation. The backend uses the same order id.
     */
    event_id: order.transactionId,
    transaction_id: order.transactionId,
    currency: CURRENCY,
    value: money(order.value),
    tax: money(order.tax ?? 0),
    shipping: money(order.shipping ?? 0),
    ...(order.coupon ? { coupon: order.coupon } : {}),
    items: order.items,
    ...userDataBlock(order.customer),
  });
}

/**
 * True the first time it is called for a given key in this tab.
 *
 * `purchase` must not be double counted. The confirmation page re-renders on
 * refresh and on navigation back to it, and each of those would otherwise
 * report the sale again and inflate revenue. Keyed per order, in
 * sessionStorage, so it survives a reload. If storage is unavailable the event
 * is allowed through — an occasional duplicate beats losing conversions.
 */
export function oncePerSession(key: string): boolean {
  if (typeof window === 'undefined') return false;
  // In-memory first. Two components mounting in the same tick both read
  // storage before either has written, so storage alone still lets a double
  // through; this closes that window.
  if (firedThisLoad.has(key)) return false;
  firedThisLoad.add(key);
  try {
    // localStorage, not sessionStorage: a refresh opens a new session in some
    // browsers and a reopened tab always does, and either would report the
    // same sale again. Keyed per order, so it never blocks a real second
    // purchase.
    if (window.localStorage.getItem(key)) return false;
    window.localStorage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/** Keys already pushed in this page load, before storage round-trips. */
const firedThisLoad = new Set<string>();
