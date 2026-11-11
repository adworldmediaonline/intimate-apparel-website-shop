'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

/**
 * Stripe Elements provider - loaded only on checkout route.
 * Defers Stripe SDK from product/cart/shop pages to reduce TBT.
 */
export default function CheckoutStripeProvider({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
