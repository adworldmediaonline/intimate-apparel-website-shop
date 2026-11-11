/**
 * The three-step checkout.
 *
 * One checkout spread over three URLs so each step is its own page view —
 * which is what makes drop-off measurable: a single-page checkout can only
 * report "started" and "bought", with nothing in between.
 */

export const CHECKOUT_STEPS = [
  { key: 'cart', label: 'Checkout', href: '/checkout' },
  { key: 'billing', label: 'Billing Info', href: '/billing-info' },
  { key: 'payment', label: 'Payment Detail', href: '/payment-detail' },
] as const;

export type CheckoutStepKey = (typeof CHECKOUT_STEPS)[number]['key'];

export const stepIndex = (key: CheckoutStepKey) =>
  CHECKOUT_STEPS.findIndex(s => s.key === key);

/**
 * Entered details, carried between steps.
 *
 * sessionStorage rather than a store: a step is a real navigation now, so the
 * React tree is torn down between them. It clears itself when the tab closes,
 * which is the right lifetime for a half-filled address.
 */
const STORAGE_KEY = 'uwh_checkout_draft';

export type CheckoutDraft = Record<string, unknown>;

export function readDraft(): CheckoutDraft {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function writeDraft(values: CheckoutDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values ?? {}));
  } catch {
    // Private mode, or storage full. Losing the draft is survivable; the
    // shopper simply re-types. Never let it break the checkout.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* see above */
  }
}

/**
 * The fields the billing step owns. Listed explicitly so the draft carries
 * what a shopper typed and nothing else — not cart contents, not totals,
 * which are derived and must never be taken from the browser.
 */
export const DRAFT_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'contactNo',
  'address',
  'city',
  'state',
  'zipCode',
  'country',
  'sameAsBillingAddress',
  'shippingFirstName',
  'shippingLastName',
  'shippingAddress',
  'shippingCity',
  'shippingState',
  'shippingZipCode',
  'shippingCountry',
  'shippingContactNo',
  'orderNote',
] as const;
