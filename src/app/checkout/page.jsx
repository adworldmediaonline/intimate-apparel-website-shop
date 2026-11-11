import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import CheckoutFlow from '@/components/version-tsx/checkout/checkout-flow';
import CheckoutStepTracking from '@/components/version-tsx/checkout/checkout-step-tracking';
import Wrapper from '@/components/wrapper';

export const metadata = {
  title: 'Unwrap Her - Checkout',
  alternates: { canonical: '/checkout' },
  // A checkout step is never a landing page.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Wrapper>
      <CheckoutStepTracking step="cart" />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Breadcrumb className="mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="mb-4 rounded-lg bg-background p-0 shadow-sm sm:p-4 md:mb-8 md:p-6">
          <CheckoutFlow step="cart" />
        </section>
      </div>
    </Wrapper>
  );
}
