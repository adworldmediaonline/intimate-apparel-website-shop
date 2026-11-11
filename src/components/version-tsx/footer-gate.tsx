'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

/**
 * Routes that render no footer.
 *
 * A checkout should have one way forward and no way sideways. The footer is
 * a wall of links out — shop categories, policies, socials — placed directly
 * under the payment button, which is the worst possible moment to offer
 * someone an exit.
 */
const FOOTERLESS = ['/checkout', '/billing-info', '/payment-detail'];

export default function FooterGate() {
  const pathname = usePathname();
  // Exact match, not startsWith: /checkout is footerless, but a future
  // /checkout-help page would not be.
  if (FOOTERLESS.includes(pathname ?? '')) return null;
  return <Footer />;
}
