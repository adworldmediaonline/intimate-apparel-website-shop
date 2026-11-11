'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { AuthDialog } from '@/components/auth/auth-dialog';
import useCheckoutSubmit from '@/hooks/use-checkout-submit';
import { authClient } from '@/lib/authClient';
import PaymentSuccessOverlay from '../../common/payment-success-overlay';
import CheckoutBillingArea from './checkout-billing-area';
import CheckoutOrderArea from './checkout-order-area';
import CheckoutStepNav from './checkout-step-nav';
import CheckoutSummaryBar from './checkout-summary-bar';
import {
  CHECKOUT_STEPS,
  DRAFT_FIELDS,
  readDraft,
  writeDraft,
  stepIndex,
} from '@/lib/checkout-steps';

/**
 * One checkout, three URLs.
 *
 * Every step mounts this same component and renders one panel of it. The
 * form lives in `useCheckoutSubmit` exactly as before, so the pricing,
 * validation and submit are the existing ones — only the layout is split.
 *
 * The pricing, validation and submit are the existing ones; only the
 * layout is split across the three routes.
 */
export default function CheckoutFlow({ step }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const checkoutData = useCheckoutSubmit();
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    setValue,
    control,
    watch,
    trigger,
    paymentSuccessful,
  } = checkoutData;
  const { cart_products } = useSelector(state => state.cart);

  const index = stepIndex(step);
  /**
   * Only the billing step fills both columns.
   *
   * Steps 1 and 3 have nothing for the left-hand column — the billing form
   * is hidden there — so the 7/12 slot sat empty and the order was pinned
   * to the right of a wide screen with two thirds of it blank. Those steps
   * get a single centred column instead.
   */
  const twoColumn = step === 'billing';
  const restored = useRef(false);

  /**
   * Put the draft back into the form.
   *
   * Each step is a real navigation, so the form is a fresh instance every
   * time — without this, moving back from Payment to Billing would show an
   * empty address the shopper had already filled in.
   */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = readDraft();
    for (const field of DRAFT_FIELDS) {
      if (draft[field] !== undefined && draft[field] !== null) {
        setValue(field, draft[field]);
      }
    }
  }, [setValue]);

  /** Keep the draft current as they type, so a step change never loses it. */
  useEffect(() => {
    const subscription = watch(values => {
      const draft = {};
      for (const field of DRAFT_FIELDS) draft[field] = values[field];
      writeDraft(draft);
    });
    return () => subscription.unsubscribe?.();
  }, [watch]);

  /**
   * An empty cart has nothing to check out. Sending them to the shop beats
   * a blank Payment page they cannot complete.
   */
  if (cart_products.length === 0) {
    return (
      <section className="rounded-lg bg-background p-6 text-center shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-foreground">
          No items found in cart to checkout
        </h3>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Return to shop
        </Link>
      </section>
    );
  }

  const goTo = href => router.push(href);

  /**
   * Step 2 is the only one that can be wrong on the way forward, so its
   * fields are validated before the move. Nothing is submitted here — the
   * order is placed on step 3 and nowhere else.
   */
  const continueFromBilling = async () => {
    const ok = await trigger();
    if (!ok) return;
    goTo(CHECKOUT_STEPS[2].href);
  };

  return (
    <>
      <CheckoutStepNav current={step} />

      <form onSubmit={handleSubmit(submitHandler)} noValidate>
        {/* Fields from other steps stay mounted but hidden, so the form keeps
            every value for the final submit. `hidden` keeps them out of the
            accessibility tree too, so nothing is announced twice. */}
        <div
          className={
            twoColumn
              ? 'grid grid-cols-1 gap-3 md:gap-8 lg:grid-cols-12'
              : 'mx-auto w-full max-w-2xl'
          }
        >
          <div className={twoColumn ? 'order-2 lg:order-1 lg:col-span-7' : ''}>
            <div hidden={step !== 'billing'}>
              {isPending && (
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              )}

              {!session && !isPending && (
                <div className="mb-6 rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      Checking out as Guest
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthDialogOpen(true)}
                      className="font-medium text-primary underline transition-colors hover:text-primary/90"
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

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  href={CHECKOUT_STEPS[0].href}
                  prefetch
                  className="text-sm text-muted-foreground underline"
                >
                  Back to order
                </Link>
                <button
                  type="button"
                  onClick={continueFromBilling}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              twoColumn
                ? 'order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-4 lg:self-start'
                : ''
            }
          >
            {/* Step 1: what they are buying, and the way forward. */}
            <div hidden={step !== 'cart'} className="space-y-3">
              <CheckoutOrderArea checkoutData={checkoutData} variant="items" />
              <CheckoutOrderArea checkoutData={checkoutData} variant="summary" />
              <button
                type="button"
                onClick={() => goTo(CHECKOUT_STEPS[1].href)}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Checkout Securely
              </button>
              <Link
                href="/cart"
                prefetch
                className="block text-center text-sm text-muted-foreground underline"
              >
                Edit cart
              </Link>
            </div>

            {/* Step 2: one line, opened on demand. The full block pushed the
                first form field most of a screen down. */}
            <div hidden={step !== 'billing'}>
              <CheckoutSummaryBar checkoutData={checkoutData} />
            </div>

            {/* Step 3: the payment panel, which carries its own submit. */}
            <div hidden={step !== 'payment'} className="space-y-3">
              <CheckoutSummaryBar checkoutData={checkoutData} />
              <CheckoutOrderArea checkoutData={checkoutData} variant="payment" />
              <Link
                href={CHECKOUT_STEPS[1].href}
                prefetch
                className="block text-center text-sm text-muted-foreground underline"
              >
                Back to billing info
              </Link>
            </div>
          </div>
        </div>
      </form>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab="signin"
      />
      <PaymentSuccessOverlay isVisible={paymentSuccessful} />
    </>
  );
}
