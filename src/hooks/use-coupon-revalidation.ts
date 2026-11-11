'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { applyCoupon, removeCoupon } from '@/redux/features/cartSlice';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { validateStoreDiscount } from '@/lib/store-api';

/**
 * Keep an applied coupon honest as the cart changes.
 *
 * `discountAmount` was worked out once, when Apply was pressed, and then
 * stored. Add a second item and the stored figure stayed put: a 10% coupon
 * on a ₹780 cart kept showing ₹78 after the cart grew to ₹1560, where it
 * should be ₹156. The customer is quoted — and charged — the wrong number,
 * because the order is submitted with this same stored amount.
 *
 * The server owns the calculation, so this re-asks it rather than trying to
 * reproduce the rules here. It also catches the other direction: remove
 * items until the cart falls under the coupon's minimum spend and the
 * coupon is dropped instead of silently continuing to discount.
 */
export function useCouponRevalidation() {
  const dispatch = useDispatch();
  const { cart_products, couponCode, discountAmount, isAutoApplied } = useSelector(
    (state: any) => state.cart
  );
  const summary = useCartSummary();

  /** The cart as the validator wants it, and as a value we can compare. */
  const signature = JSON.stringify(
    (Array.isArray(cart_products) ? cart_products : []).map((item: any) => [
      item._id,
      Number(item.orderQuantity ?? 0),
      Number(item.finalPriceDiscount ?? item.price ?? 0),
    ])
  );

  const lastChecked = useRef<string | null>(null);

  useEffect(() => {
    if (!couponCode) {
      lastChecked.current = null;
      return;
    }
    const key = `${couponCode}|${signature}`;
    if (lastChecked.current === key) return;

    const items = (Array.isArray(cart_products) ? cart_products : []).map(
      (item: any) => ({
        productId: item._id,
        quantity: Number(item.orderQuantity ?? 0),
        unitPrice: Number(item.finalPriceDiscount ?? item.price ?? 0),
        title: item.title,
      })
    );
    if (items.length === 0) return;

    // Debounced: pressing + three times should ask once, not three times.
    const timer = setTimeout(async () => {
      try {
        const result = await validateStoreDiscount(
          couponCode,
          summary.subtotal,
          items,
          {
            cartTotal: summary.subtotal + summary.effectiveShippingCost,
            shippingCost: summary.effectiveShippingCost,
          }
        );
        lastChecked.current = key;

        if (!result.valid || result.discountAmount <= 0) {
          // No longer qualifies — under the minimum spend, or the eligible
          // products have left the cart.
          dispatch(removeCoupon());
          return;
        }

        // Only dispatch on a real change, or every cart touch re-renders
        // everything downstream for nothing.
        if (Math.abs(Number(discountAmount) - result.discountAmount) > 0.009) {
          dispatch(
            applyCoupon({
              code: couponCode,
              discountAmount: result.discountAmount,
              isAutoApplied: Boolean(isAutoApplied),
            })
          );
        }
      } catch {
        // Network trouble: leave the coupon as it stands. The server
        // recomputes at order time, so a stale figure here is a display
        // problem rather than a wrong charge.
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    couponCode,
    signature,
    cart_products,
    summary.subtotal,
    summary.effectiveShippingCost,
    discountAmount,
    isAutoApplied,
    dispatch,
  ]);
}
