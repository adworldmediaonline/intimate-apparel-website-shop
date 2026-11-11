'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authClient } from '@/lib/authClient';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon } from '@/redux/features/cartSlice';
import {
  getActiveCoupons,
  validateStoreDiscount,
  type RawCoupon,
} from '@/lib/store-api';
import { notifyError } from '@/utils/toast';
import { useCartSummary } from './use-cart-summary';
import { CURRENCY_SYMBOL } from '@/lib/brand';

type CartProduct = {
  _id: string;
  title?: string;
  finalPriceDiscount?: number | string;
  price?: number | string;
  orderQuantity?: number;
};

type CartState = {
  cart_products: CartProduct[];
  couponCode: string | null;
  discountAmount: number;
};

function getCouponValue(coupon: RawCoupon) {
  if (coupon.discountType === 'fixed_amount') {
    return Number(coupon.discountAmount ?? 0);
  }
  return Number(coupon.discountPercentage ?? 0);
}

function getPromoSortValue(coupon: RawCoupon) {
  const value = getCouponValue(coupon);
  if (coupon.discountType === 'fixed_amount') return value;
  return value * 100000;
}

function getPromoApplyKey(coupon: RawCoupon | null) {
  if (!coupon) return null;
  return coupon.couponCode?.trim() || `checkout-promo:${coupon._id}`;
}

function calculateCheckoutPromoDiscount(coupon: RawCoupon, discountBase: number) {
  const base = Math.max(0, Number(discountBase) || 0);
  if (base <= 0) return 0;

  if (coupon.discountType === 'fixed_amount') {
    return Math.min(Number(coupon.discountAmount ?? 0) || 0, base);
  }

  const percentage = Number(coupon.discountPercentage ?? 0) || 0;
  return Math.round(base * (percentage / 100) * 100) / 100;
}

/**
 * One in-flight coupon fetch shared by every mounted instance of this hook.
 *
 * `getActiveCoupons` is wrapped in React `cache()`, which dedupes per server
 * render but does nothing in the browser. Checkout renders CheckoutOrderArea
 * three times on mobile — items, summary and payment — so without this the
 * same request went out three times on every load.
 *
 * Held for a short window rather than forever, so a coupon created in the
 * admin still appears without a hard reload.
 */
const COUPON_CACHE_MS = 60_000;
let couponRequest: { at: number; promise: Promise<RawCoupon[]> } | null = null;

function fetchActiveCouponsShared(): Promise<RawCoupon[]> {
  const now = Date.now();
  if (!couponRequest || now - couponRequest.at > COUPON_CACHE_MS) {
    couponRequest = {
      at: now,
      // A failed request must not be cached, or one blip blocks coupons for
      // the next minute.
      promise: getActiveCoupons().catch(error => {
        couponRequest = null;
        throw error;
      }),
    };
  }
  return couponRequest.promise;
}

export function useCheckoutPromoCoupon() {
  const dispatch = useDispatch();
  /** Identifies the shopper to first-order-only coupons when signed in. */
  const { data: session } = authClient.useSession();
  const { cart_products, couponCode } = useSelector(
    (state: { cart: CartState }) => state.cart
  );
  const summary = useCartSummary();
  const [promoCoupon, setPromoCoupon] = useState<RawCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    fetchActiveCouponsShared()
      .then((coupons) => {
        if (cancelled) return;
        const promos = coupons
          .filter(
            (coupon) =>
              coupon.status === 'active' &&
              coupon.isPublic !== false &&
              coupon.showInCheckoutPromo === true &&
              ['percentage', 'fixed_amount'].includes(coupon.discountType) &&
              getCouponValue(coupon) > 0
          )
          .sort((a, b) => {
            const priorityDelta = Number(b.priority ?? 0) - Number(a.priority ?? 0);
            if (priorityDelta !== 0) return priorityDelta;
            return getPromoSortValue(b) - getPromoSortValue(a);
          });
        setPromoCoupon(promos[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setPromoCoupon(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cartItemsForValidation = useMemo(
    () =>
      (Array.isArray(cart_products) ? cart_products : []).map((item) => ({
        productId: item._id,
        quantity: Number(item.orderQuantity ?? 0),
        unitPrice: Number(item.finalPriceDiscount ?? item.price ?? 0),
        title: item.title,
      })),
    [cart_products]
  );

  const promoPercent =
    promoCoupon?.discountType === 'percentage'
      ? Number(promoCoupon.discountPercentage ?? 0)
      : null;
  const promoLabel =
    promoCoupon?.discountType === 'percentage'
      ? `${Number(promoCoupon.discountPercentage ?? 0)}%`
      : `${CURRENCY_SYMBOL}${Number(promoCoupon?.discountAmount ?? 0).toFixed(2)}`;
  const promoTitle = promoCoupon?.title?.trim() || `Additional ${promoLabel} discount`;
  const promoDescription =
    promoCoupon?.description?.trim() ||
    `Click here to get an additional ${promoLabel} discount.`;
  const promoApplyKey = getPromoApplyKey(promoCoupon);
  const isApplied =
    Boolean(promoApplyKey) &&
    couponCode?.toUpperCase() === promoApplyKey?.toUpperCase() &&
    summary.discountAmount > 0;

  const applyPromo = useCallback(async () => {
    if (!promoCoupon || isApplying || isApplied) return false;
    if (cartItemsForValidation.length === 0) {
      notifyError('Your cart is empty');
      return false;
    }

    setIsApplying(true);
    try {
      const promoCode = promoCoupon.couponCode?.trim();
      let discountAmount = 0;

      if (promoCode) {
        const result = await validateStoreDiscount(
          promoCode,
          summary.subtotal,
          cartItemsForValidation,
          {
            cartTotal: summary.subtotal + summary.effectiveShippingCost,
            shippingCost: summary.effectiveShippingCost,
            // First-order-only coupons need to know who is asking. A signed-in
            // shopper is identified here; a guest is not, and the backend
            // tells them to sign in rather than guessing.
            customerEmail: session?.user?.email ?? undefined,
          }
        );

        if (!result.valid) {
          notifyError(result.message);
          return false;
        }

        discountAmount = result.discountAmount;
      } else {
        discountAmount = calculateCheckoutPromoDiscount(
          promoCoupon,
          summary.subtotal + summary.effectiveShippingCost
        );
      }

      if (discountAmount <= 0) {
        notifyError('Promo discount is not available for this cart');
        return false;
      }

      dispatch(
        applyCoupon({
          code: getPromoApplyKey(promoCoupon) ?? promoTitle,
          discountAmount,
          isAutoApplied: false,
        })
      );
      return true;
    } catch {
      notifyError('Failed to apply promo. Please try again.');
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [
    cartItemsForValidation,
    dispatch,
    isApplied,
    isApplying,
    promoCoupon,
    promoTitle,
    summary.effectiveShippingCost,
    summary.subtotal,
  ]);

  return {
    promoCoupon,
    promoLabel,
    promoTitle,
    promoDescription,
    promoPercent,
    isApplied,
    isLoading,
    isApplying,
    applyPromo,
    savedAmount: isApplied ? summary.discountAmount : 0,
  };
}
