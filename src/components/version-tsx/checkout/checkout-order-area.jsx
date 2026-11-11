'use client';

import { CURRENCY_SYMBOL, splitPartialPayment } from '@/lib/brand';
import { gstBreakdownFromInclusive, CGST_LABEL, SGST_LABEL } from '@/lib/gst';
import { usePaymentSettings } from '@/hooks/use-payment-settings';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { useCartActions } from '@/hooks/use-cart-actions';
import { get_cart_products } from '@/redux/features/cartSlice';
import { Banknote, ChevronDown, Lock, Smartphone } from 'lucide-react';
import {
  AutoApplySavingsBanner,
  CartItemCard,
  getCartItemLineTotal,
  getCartItemProductHref,
} from '@/components/version-tsx/cart';
import CheckoutPromoSection from './checkout-promo-section';
import CartCouponRow from '@/components/version-tsx/cart/cart-coupon-row';
import BogoProgress from '@/components/version-tsx/cart/bogo-progress';
import BogoCrossSell from '@/components/version-tsx/cart/bogo-cross-sell';
import CheckoutCouponList from './checkout-coupon-list';
import { useCheckoutPromoCoupon } from '@/hooks/use-checkout-promo-coupon';

export default function CheckoutOrderArea({ checkoutData, variant = 'full' }) {
  const dispatch = useDispatch();
  const [cartDataLoaded, setCartDataLoaded] = useState(false);

  const {
    cartTotal = 0,
    isCheckoutSubmit,
    processingPayment,
    tax_preview,
    isTaxLoading,
    selectedPaymentMethod = 'razorpay',
    setSelectedPaymentMethod,
    register,
    // Priced once in useCheckoutSubmit and passed down, so the three
    // variants of this card do not each quote the offer separately.
    bogo = { offer: null, discount: 0, freeByProduct: {}, unitsToNextFree: 0 },
  } = checkoutData;

  const { cart_products, couponCode, discountAmount, isAutoApplied } = useSelector(state => state.cart);
  const summary = useCartSummary();
  /* Active admin coupon for this cart, and the action that applies it. */
  const promo = useCheckoutPromoCoupon();
  const { handleIncrement, handleDecrement, handleRemove } = useCartActions();


  const taxAmountDollars = tax_preview?.taxCollected
    ? (tax_preview.tax ?? 0) / 100
    : 0;
  const totalWithTaxDollars = tax_preview?.taxCollected
    ? (tax_preview.total ?? 0) / 100
    : null;
  const isDisabled = isCheckoutSubmit || processingPayment;

  // Total shown must equal the actual charge: prefer the tax-inclusive preview total,
  // otherwise the cart total / display total.
  const displayFinalTotal =
    Number(
      totalWithTaxDollars !== null ? totalWithTaxDollars : Number(cartTotal) || summary.displayTotal
    ) || 0;

  // Which methods to offer comes from the admin's payment settings. These
  // figures are only what the shopper is shown — the server recomputes the
  // split and re-checks that the method is enabled before taking money.
  const paymentSettings = usePaymentSettings();
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  /**
   * Shipping is not taxed, so it comes off before the extraction — the same
   * rule the invoice uses.
   */
  const gstBreakdown = gstBreakdownFromInclusive(
    Number(displayFinalTotal) - Number(summary.effectiveShippingCost || 0)
  );
  const partialAvailable = paymentSettings.partialEnabled && displayFinalTotal > 0;
  const partialSplit = splitPartialPayment(
    displayFinalTotal,
    paymentSettings.partialPercent
  );
  const isPartialSelected = selectedPaymentMethod === 'partial';

  // The default selection is Razorpay. If an admin has switched that method
  // off, nothing would be selected and the submit would go down a disabled
  // path, so fall through to whatever is actually on offer.
  useEffect(() => {
    const available = [
      paymentSettings.razorpayEnabled && 'razorpay',
      partialAvailable && 'partial',
      paymentSettings.codEnabled && 'cod',
    ].filter(Boolean);
    if (available.length && !available.includes(selectedPaymentMethod)) {
      setSelectedPaymentMethod?.(available[0]);
    }
  }, [
    paymentSettings.razorpayEnabled,
    paymentSettings.codEnabled,
    partialAvailable,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  ]);

  const displayCouponCode = couponCode?.startsWith('checkout-promo:')
    ? 'Promo'
    : couponCode;

  useEffect(() => {
    dispatch(get_cart_products());

    const quickCheck = setTimeout(() => {
      setCartDataLoaded(true);
    }, 100);

    return () => clearTimeout(quickCheck);
  }, [dispatch]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!cartDataLoaded) {
        setCartDataLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [cartDataLoaded]);

  if (!cartDataLoaded) {
    const loadingTitle =
      variant === 'summary'
        ? 'Order Summary'
        : variant === 'payment'
          ? 'Payment method'
          : 'Your Order';
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
          {loadingTitle}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">
            Loading order details...
          </span>
        </div>
      </div>
    );
  }

  const showItems = variant === 'items' || variant === 'full';
  const showSummary = variant === 'summary' || variant === 'full';
  // Payment method + submit. On desktop (full) it stays inside the order card; on mobile
  // it is rendered on its own (variant="payment") so it can sit after the billing form.
  const showPayment = variant === 'payment' || variant === 'full';
  const items = Array.isArray(cart_products) ? cart_products : [];

  const content = (
    <div className="bg-card rounded-lg shadow-sm p-3 md:p-6 border border-border">
      {showItems && (
        <>
          <h3 className="text-base md:text-xl font-semibold text-foreground mb-2 md:mb-6">
            Your Order
          </h3>

          {/* The same offer card the drawer shows. Dropping it here meant the
              progress a shopper was tracking vanished at the last step. */}
          <div className="mb-3">
            <BogoProgress state={bogo} />
          </div>

          {/* Lines are separated by their own rule now, so the old 12px gap
              between them stacked on top of that border. */}
          <div className="mb-2 md:mb-4">
            {items.map((item, idx) => (
              <CartItemCard
                key={`${item._id}-${item.selectedOption?.title ?? ''}-${idx}`}
                item={item}
                lineTotal={getCartItemLineTotal(item)}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
                productHref={getCartItemProductHref}
                variant="compact"
                disabled={isDisabled}
                freeUnits={bogo.freeByProduct?.[String(item._id)] ?? 0}
              />
            ))}
          </div>

          <BogoCrossSell
            state={bogo}
            inCartIds={items.map(i => String(i._id))}
          />
        </>
      )}

      {showSummary && (
        <div className={showItems ? 'border-t border-border pt-3 mt-3 md:pt-6 md:mt-6' : 'pt-0 mt-0'}>
          <h3 className="text-base md:text-xl font-semibold text-foreground mb-2 md:mb-4">
            Order Summary
          </h3>

          <div className="space-y-1.5 md:space-y-3">
            {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
                (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
              <AutoApplySavingsBanner
                percent={
                  summary.appliedCouponPercentage ??
                  (summary.productLevelSavings > 0
                    ? summary.productLevelPercent
                    : summary.autoApplyPercent)
                }
                couponCode={summary.appliedCouponCode ?? summary.couponCode}
                savedAmount={summary.discountAmount}
              />
            )}

            {/* No second confirmation card here.
                CheckoutPromoSection's "applied" slot used to render below
                this one, announcing the same discount in different words —
                two green boxes stacked, reading as two separate savings.
                The banner above now carries the code and the amount. */}


            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {CURRENCY_SYMBOL}{(Number(summary.subtotal) || 0).toFixed(2)}
              </span>
            </div>

            {couponCode && discountAmount > 0 &&
              (isAutoApplied ? (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span className="font-medium">
                    {summary.subtotal > 0
                      ? `${Math.round((discountAmount / summary.subtotal) * 100)}% OFF applied`
                      : 'Discount applied'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({displayCouponCode})</span>
                  <span className="font-medium">-{CURRENCY_SYMBOL}{discountAmount.toFixed(2)}</span>
                </div>
              ))}

            {bogo.discount > 0 && (
              <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                <span>{bogo.offer?.name ?? 'Offer'}</span>
                <span className="font-medium">
                  -{CURRENCY_SYMBOL}{Number(bogo.discount).toFixed(2)}
                </span>
              </div>
            )}

            {summary.effectiveShippingCost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Shipping
                  {summary.shippingDiscountPercent != null && summary.shippingDiscountPercent > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 ml-1.5 font-medium">
                      ({summary.shippingDiscountPercent}% off)
                    </span>
                  )}
                </span>
                <span className="font-medium text-foreground">
                  {CURRENCY_SYMBOL}{summary.effectiveShippingCost.toFixed(2)}
                </span>
              </div>
            )}

            {summary.qualifiesForFreeShipping && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            )}

            {isTaxLoading ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax (estimated)</span>
                <span className="text-sm text-muted-foreground">
                  Calculating...
                </span>
              </div>
            ) : tax_preview ? (
              tax_preview.taxCollected ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax (estimated)</span>
                  <span className="font-medium text-foreground">
                    {CURRENCY_SYMBOL}{Number(taxAmountDollars).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-sm text-muted-foreground">
                    No tax for your location
                  </span>
                </div>
              )
            ) : null}
          </div>

          <div className="border-t border-border pt-2 mt-2 md:pt-3 md:mt-4">
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg font-semibold text-foreground">Total</span>
              <span className="text-base md:text-lg font-semibold text-foreground">
                {CURRENCY_SYMBOL}{Number(displayFinalTotal).toFixed(2)}
              </span>
            </div>

            {/* Prices include GST, so this explains the total rather than
                adding to it. Collapsed by default: most shoppers want the
                one number, and the ones who need the split need it exactly. */}
            {gstBreakdown && (
              <>
                <button
                  type="button"
                  onClick={() => setShowTaxBreakdown(v => !v)}
                  aria-expanded={showTaxBreakdown}
                  aria-controls="gst-breakdown"
                  className="mt-1.5 flex w-full items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronDown
                    className={`size-3.5 shrink-0 transition-transform ${
                      showTaxBreakdown ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                  <span>Price breakdown (incl. GST)</span>
                </button>
                {showTaxBreakdown && (
                  <dl
                    id="gst-breakdown"
                    className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3 text-xs"
                  >
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Base Price</dt>
                      <dd className="font-medium text-foreground">
                        {CURRENCY_SYMBOL}{gstBreakdown.basePrice.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{CGST_LABEL}</dt>
                      <dd className="font-medium text-foreground">
                        {CURRENCY_SYMBOL}{gstBreakdown.cgst.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{SGST_LABEL}</dt>
                      <dd className="font-medium text-foreground">
                        {CURRENCY_SYMBOL}{gstBreakdown.sgst.toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                )}
              </>
            )}
          </div>

          {/*
            The admin-managed coupon offer.

            CheckoutPromoSection was written but never rendered anywhere, so
            the coupon existed in the admin and in the API and was invisible
            at checkout. Mounted here below the Total: the shopper sees what
            they owe first, then the offer to reduce it.

            The "applied" confirmation is a second instance higher up, which
            is how the component is designed — only this "banner" instance
            owns the success popup, so it cannot fire twice.
          */}
          {/* The best coupon with its Apply button, shown directly — the
              same row the cart drawer uses, so the offer does not change
              shape between the two screens. The dialog below still lists
              every coupon for anyone who wants to compare. */}
          <CartCouponRow />

          {/* Every usable coupon, independent of the per-coupon
              `showInCheckoutPromo` flag that the banner below depends on. */}
          <CheckoutCouponList disabled={isDisabled} />

          {promo.promoCoupon && (
            <CheckoutPromoSection
              slot="banner"
              orderTotal={Number(displayFinalTotal) || 0}
              applied={promo.isApplied}
              disabled={isDisabled || promo.isApplying}
              onApply={promo.applyPromo}
              promoLabel={promo.promoLabel}
              promoTitle={promo.promoTitle}
              promoDescription={promo.promoDescription}
              savedAmount={promo.savedAmount}
            />
          )}

        </div>
      )}

      {showPayment && (
        <div className={showSummary ? 'mt-6' : ''}>
          <div className={showSummary ? 'mt-6' : ''}>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Payment method
            </h3>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {paymentSettings.razorpayEnabled && (
              <label
                htmlFor="razorpay-payment"
                className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <input
                  type="radio"
                  id="razorpay-payment"
                  name="paymentMethod"
                  value="razorpay"
                  checked={selectedPaymentMethod === 'razorpay'}
                  onChange={() => setSelectedPaymentMethod?.('razorpay')}
                  className="h-4 w-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Smartphone className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    UPI, Cards, Netbanking &amp; Wallets
                  </span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5 shrink-0" aria-hidden />
                    Secured by Razorpay
                  </p>
                </div>
              </label>
              )}
              {partialAvailable && (
                <label
                  htmlFor="partial-payment"
                  className="flex cursor-pointer items-start gap-4 border-t border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <input
                    type="radio"
                    id="partial-payment"
                    name="paymentMethod"
                    value="partial"
                    checked={isPartialSelected}
                    onChange={() => setSelectedPaymentMethod?.('partial')}
                    className="mt-1 h-4 w-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                  />
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <Banknote className="size-5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">
                      Partial COD
                    </span>
                    {/* The amounts, not the percentage: what a shopper needs
                        to decide is how much leaves their account today and
                        how much cash to have ready at the door. */}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Pay {CURRENCY_SYMBOL}
                      {partialSplit.payNow.toFixed(2)} now and{' '}
                      {CURRENCY_SYMBOL}
                      {partialSplit.dueOnDelivery.toFixed(2)} in cash on delivery
                    </p>
                    {isPartialSelected && (
                      <dl className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Pay now</dt>
                          <dd className="font-medium text-foreground">
                            {CURRENCY_SYMBOL}
                            {partialSplit.payNow.toFixed(2)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">COD amount</dt>
                          <dd className="font-medium text-foreground">
                            {CURRENCY_SYMBOL}
                            {partialSplit.dueOnDelivery.toFixed(2)}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </label>
              )}
              {paymentSettings.codEnabled && (
              <label
                htmlFor="cod-payment"
                className="flex cursor-pointer items-center gap-4 border-t border-border p-4 transition-colors hover:bg-muted/30"
              >
                <input
                  type="radio"
                  id="cod-payment"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={() => setSelectedPaymentMethod?.('cod')}
                  className="h-4 w-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Banknote className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">Cash on Delivery</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pay in cash when your order arrives
                  </p>
                </div>
              </label>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isCheckoutSubmit || processingPayment}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing Your Order...
                </span>
              ) : (
                // The button states what is actually being charged now, which
                // for a part payment is the advance, not the order total.
                isPartialSelected
                  ? `Pay Now - ${CURRENCY_SYMBOL}${partialSplit.payNow.toFixed(2)}`
                  : `${selectedPaymentMethod === 'cod' ? 'Place COD Order' : 'Complete Purchase'} - ${CURRENCY_SYMBOL}${Number(displayFinalTotal).toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return content;
}
