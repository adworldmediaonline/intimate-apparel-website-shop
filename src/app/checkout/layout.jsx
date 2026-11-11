// import CheckoutStripeProvider from '@/components/checkout-stripe-provider';

/**
 * Checkout layout. Checkout is Razorpay-only, so Stripe Elements is not loaded.
 * To bring card payments back, restore the Stripe wrapper below.
 */
export default function CheckoutLayout({ children }) {
  // return <CheckoutStripeProvider>{children}</CheckoutStripeProvider>;
  return children;
}
