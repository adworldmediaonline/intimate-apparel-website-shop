'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * One analytics event per checkout step.
 *
 * This is the point of splitting the checkout: on a single page the funnel
 * could only report "started" and "bought", so a shopper abandoning at the
 * address was indistinguishable from one abandoning at payment. Three URLs
 * means three page views and a drop-off number between each.
 *
 * Meta needs the explicit PageView — its pixel fires once on load and does
 * not see a client-side route change, so without this the second and third
 * steps are invisible to it.
 */
const STEP_EVENT = {
  cart: 'checkout_step_cart',
  billing: 'checkout_step_billing',
  payment: 'checkout_step_payment',
};

export default function CheckoutStepTracking({ step }) {
  const pathname = usePathname();
  // Keyed on the path, so going back to a step reports it again — a repeat
  // visit to Billing is a real signal, not noise.
  const sent = useRef(null);

  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;

    const stepNumber = { cart: 1, billing: 2, payment: 3 }[step] ?? 0;

    try {
      // Meta
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
        window.fbq('trackCustom', 'CheckoutStep', {
          step: stepNumber,
          step_name: step,
          path: pathname,
        });
      }

      // GA4 / GTM
      if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: STEP_EVENT[step] ?? 'checkout_step',
          checkout_step: stepNumber,
          checkout_step_name: step,
          page_path: pathname,
        });
      }
    } catch {
      // Analytics must never take the checkout down with it.
    }
  }, [pathname, step]);

  return null;
}
