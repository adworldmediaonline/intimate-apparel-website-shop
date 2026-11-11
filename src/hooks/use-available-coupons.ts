'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { authClient } from '@/lib/authClient';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { applyCoupon } from '@/redux/features/cartSlice';
import { getActiveCoupons, validateStoreDiscount, type RawCoupon } from '@/lib/store-api';
import { notifyError } from '@/utils/toast';
import { useCartSummary } from './use-cart-summary';

/** A coupon as the list renders it. */
export interface AvailableCoupon {
  id: string;
  /** What the shopper types or sees; always present, since the list is code-led. */
  code: string;
  title: string;
  description: string;
  /** "10%" or "₹200", ready to print. */
  label: string;
  minimumAmount: number;
  /** False when the cart has not reached `minimumAmount` yet. */
  eligible: boolean;
}

type CartProduct = {
  _id: string;
  title?: string;
  finalPriceDiscount?: number | string;
  price?: number | string;
  orderQuantity?: number;
};

type CartState = { cart_products: CartProduct[]; couponCode: string | null };

/**
 * Every coupon a shopper could use, for the "View coupons" list.
 *
 * Deliberately broader than `useCheckoutPromoCoupon`, which shows the single
 * coupon flagged `showInCheckoutPromo` as a one-click banner. That flag is
 * opt-in per coupon and easy to leave unticked, which meant a live coupon
 * could be invisible at checkout with nothing to explain why. This lists
 * anything public and active that has a code, so creating a coupon is
 * enough to make it reachable.
 *
 * Coupons below their minimum spend are listed but not applicable — telling
 * a shopper "spend ₹200 more for 10% off" is worth more than hiding it.
 */
export function useAvailableCoupons() {
  const dispatch = useDispatch();
  const { data: session } = authClient.useSession();
  const { cart_products, couponCode } = useSelector(
    (state: { cart: CartState }) => state.cart
  );
  const summary = useCartSummary();

  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const subtotal = summary.subtotal;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getActiveCoupons()
      .then(list => {
        if (cancelled) return;
        const usable = list
          .filter(
            c =>
              c.status === 'active' &&
              c.isPublic !== false &&
              ['percentage', 'fixed_amount'].includes(c.discountType ?? '') &&
              Boolean(c.couponCode?.trim())
          )
          .map(c => {
            const isPercent = c.discountType === 'percentage';
            const value = Number(
              (isPercent ? c.discountPercentage : c.discountAmount) ?? 0
            );
            const minimumAmount = Number(c.minimumAmount ?? 0);
            return {
              id: String(c._id),
              code: String(c.couponCode).trim().toUpperCase(),
              title: c.title?.trim() || `${value}${isPercent ? '%' : ''} off`,
              description: c.description?.trim() ?? '',
              label: isPercent
                ? `${value}%`
                : `${CURRENCY_SYMBOL}${value.toFixed(2)}`,
              minimumAmount,
              eligible: subtotal >= minimumAmount,
              _value: value,
            };
          })
          .filter(c => c._value > 0)
          // Best offer first, then the ones within reach.
          .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b._value - a._value)
          .map(({ _value, ...rest }) => rest);

        setCoupons(usable);
      })
      .catch(() => {
        if (!cancelled) setCoupons([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subtotal]);

  const cartItems = useMemo(
    () =>
      (Array.isArray(cart_products) ? cart_products : []).map(item => ({
        productId: item._id,
        quantity: Number(item.orderQuantity ?? 0),
        unitPrice: Number(item.finalPriceDiscount ?? item.price ?? 0),
        title: item.title,
      })),
    [cart_products]
  );

  const apply = useCallback(
    async (code: string) => {
      if (applyingCode) return false;
      if (cartItems.length === 0) {
        notifyError('Your cart is empty');
        return false;
      }

      setApplyingCode(code);
      try {
        // The server decides, not the list: a coupon can be code-valid and
        // still fail on minimum spend, product scope or first-order rules.
        const result = await validateStoreDiscount(code, subtotal, cartItems, {
          cartTotal: subtotal + summary.effectiveShippingCost,
          shippingCost: summary.effectiveShippingCost,
          customerEmail: session?.user?.email ?? undefined,
        });

        if (!result.valid) {
          notifyError(result.message);
          return false;
        }
        if (result.discountAmount <= 0) {
          notifyError('This coupon gives no discount on your current cart');
          return false;
        }

        dispatch(
          applyCoupon({
            code,
            discountAmount: result.discountAmount,
            isAutoApplied: false,
          })
        );
        return true;
      } catch {
        notifyError('Could not apply this coupon. Please try again.');
        return false;
      } finally {
        setApplyingCode(null);
      }
    },
    [applyingCode, cartItems, dispatch, session, subtotal, summary.effectiveShippingCost]
  );

  return {
    coupons,
    isLoading,
    applyingCode,
    apply,
    /** The code currently on the cart, so the list can mark it. */
    appliedCode: couponCode?.toUpperCase() ?? null,
  };
}
