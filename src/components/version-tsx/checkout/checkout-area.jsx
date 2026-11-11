'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AuthDialog } from '@/components/auth/auth-dialog';
import useCheckoutSubmit from '@/hooks/use-checkout-submit';
import { useMediaQuery } from '@/hooks/use-media-query';
import PaymentSuccessOverlay from '../../common/payment-success-overlay';

import { authClient } from '@/lib/authClient';
import CheckoutBillingArea from './checkout-billing-area';
import CheckoutOrderArea from './checkout-order-area';

function BillingContent({
  isPending,
  session,
  setAuthDialogOpen,
  register,
  errors,
  setValue,
  control,
  checkoutData,
}) {
  return (
    <div className="space-y-6">
      {isPending && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {!session && !isPending && (
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                ?
              </div>
              <span className="font-medium text-foreground">
                Checking out as Guest
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAuthDialogOpen(true)}
              className="text-primary hover:text-primary/90 underline font-medium transition-colors"
            >
              Sign In Instead
            </button>
          </div>
        </div>
      )}

      <CheckoutBillingArea
        register={register}
        errors={errors}
        setValue={setValue}
        control={control}
        checkoutData={checkoutData}
      />
    </div>
  );
}

export default function CheckoutArea() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const checkoutData = useCheckoutSubmit();
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    setValue,
    control,
    paymentSuccessful,
  } = checkoutData;
  const { cart_products } = useSelector(state => state.cart);

  return (
    <>
      {/* Phone gets almost no outer chrome: the cards inside carry their own
          padding, so this wrapper's was a second frame around them. Desktop
          keeps the original spacing. */}
      <section className="bg-background rounded-lg shadow-sm p-0 sm:p-4 md:p-6 mb-4 md:mb-8">
        <div className="">
          {cart_products.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                No items found in cart to checkout
              </h3>
              <Link
                href="/shop"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Return to shop
              </Link>
            </div>
          )}
          {cart_products.length > 0 && (
            <form onSubmit={handleSubmit(submitHandler)} noValidate>
              {/* Mobile: Your Order first, billing second, Order Summary third */}
              {/* Desktop: Billing on left, full order on right (unchanged from original) */}
              {/* Conditional render ensures only one CardElement (Stripe allows only one per page) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-8">
                {isDesktop ? (
                  <>
                    {/* Desktop: Billing left, full order right */}
                    <div className="lg:col-span-7 order-1">
                      <BillingContent
                        isPending={isPending}
                        session={session}
                        setAuthDialogOpen={setAuthDialogOpen}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        control={control}
                        checkoutData={checkoutData}
                      />
                    </div>
                    <div className="lg:col-span-5 order-2 lg:sticky lg:top-4 lg:self-start">
                      <CheckoutOrderArea checkoutData={checkoutData} variant="full" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mobile: Order Summary (items + totals), then billing, then payment */}
                    <div className="order-1 space-y-3">
                      <CheckoutOrderArea checkoutData={checkoutData} variant="items" />
                      <CheckoutOrderArea checkoutData={checkoutData} variant="summary" />
                    </div>
                    <div className="order-2">
                      <BillingContent
                        isPending={isPending}
                        session={session}
                        setAuthDialogOpen={setAuthDialogOpen}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        control={control}
                        checkoutData={checkoutData}
                      />
                    </div>
                    <div className="order-3">
                      <CheckoutOrderArea checkoutData={checkoutData} variant="payment" />
                    </div>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultTab="signin" />

      {/* Payment Success Overlay - Shows immediately, then auto-redirects */}
      <PaymentSuccessOverlay isVisible={paymentSuccessful} />
    </>
  );
}
