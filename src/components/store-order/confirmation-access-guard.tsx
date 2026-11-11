'use client';

import { useEffect, useState } from 'react';

/**
 * The confirmation page used to bounce anyone without a "paid in this tab"
 * stamp over to order tracking. That turned out to cost more than it bought:
 * a refresh, a restored tab, or opening the link on the phone the order was
 * placed from all landed on tracking instead of the receipt, which reads as
 * the page being broken.
 *
 * The page now always renders. Nothing sensitive is being protected by hiding
 * it — the order is fetched from the same public endpoint that order tracking
 * uses, so a redirect only decided which of two pages showed the same data.
 *
 * What the stamp is still for: telling a genuine, just-completed payment apart
 * from a revisit, so the GA4/Meta purchase event is reported once and not
 * again on every reload. See `hasJustPaid`.
 */
const paidKey = (orderId: string) => `order-paid-${orderId}`;

/** Called by checkout once an order is saved, before routing to the receipt. */
export const markOrderPaidInSession = (orderId: string) => {
  try {
    sessionStorage.setItem(paidKey(orderId), 'true');
  } catch {
    // Private mode or blocked storage — conversion reporting falls back to
    // the per-order guard in the analytics layer.
  }
};

/** True when this tab is the one that completed the payment. */
export const hasJustPaid = (orderId: string): boolean => {
  try {
    return sessionStorage.getItem(paidKey(orderId)) === 'true';
  } catch {
    return false;
  }
};

export type ConfirmationAccess = 'checking' | 'granted';

/**
 * Kept so the page can still hold its skeleton for one tick rather than
 * flashing, and so callers do not all have to change. It no longer redirects.
 */
export const useConfirmationAccessGuard = (orderId: string): ConfirmationAccess => {
  const [access, setAccess] = useState<ConfirmationAccess>('checking');

  useEffect(() => {
    if (!orderId) return;
    setAccess('granted');
  }, [orderId]);

  return access;
};
