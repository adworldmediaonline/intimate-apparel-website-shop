'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import useCartInfo from '@/hooks/use-cart-info';
import {
  getStoreShippingSettings,
  type ShippingDiscountTier,
} from '@/lib/store-api';
import type { CartItemType, CartSummary } from '@/components/version-tsx/cart/cart-types';

type CartState = {
  cart_products: CartItemType[];
  couponCode: string | null;
  discountAmount: number;
  isAutoApplied: boolean;
};

/**
 * Free shipping from this amount up, measured on what is actually paid for
 * the products: subtotal minus every discount.
 *
 * Mirrors FREE_SHIPPING_SUBTOTAL_THRESHOLD and SHIPPING_COST in the backend's
 * order.controller.js, which are the figures actually charged. Keep the two in
 * step: if the storefront promises a threshold the server does not apply, the
 * shipping line changes between the cart and the receipt. The admin's
 * freeShippingThreshold setting overrides the first of these when set.
 */
const FREE_SHIPPING_SUBTOTAL_THRESHOLD = 500;

/** Flat shipping on an order below the threshold. Mirrors SHIPPING_COST. */
const FLAT_SHIPPING_COST = 100;

export type UseCartSummaryOptions = {
  /** When true, refetch shipping settings (e.g. when cart drawer opens). Ensures threshold updates from admin are reflected immediately. */
  refetchWhen?: boolean;
};

/**
 * Computes cart summary: subtotal, shipping, discount, total, free-shipping state.
 * Reusable across cart drawer, cart page, checkout order summary.
 * Refetches shipping threshold when refetchWhen becomes true and on window focus for instant admin updates.
 */
export function useCartSummary(
  options?: UseCartSummaryOptions
): CartSummary & { quantity: number } {
  const { refetchWhen } = options ?? {};
  const { subtotal, quantity } = useCartInfo();
  const { cart_products, couponCode, discountAmount, isAutoApplied } =
    useSelector((s: { cart: CartState }) => s.cart);
  const [shippingSettings, setShippingSettings] = useState<{
    freeShippingThreshold: number | null;
    shippingDiscountTiers: ShippingDiscountTier[];
  }>({ freeShippingThreshold: null, shippingDiscountTiers: [] });
  const freeShippingThreshold = shippingSettings.freeShippingThreshold;
  const freeShippingUnlockThreshold =
    freeShippingThreshold != null && freeShippingThreshold > 0
      ? freeShippingThreshold
      : FREE_SHIPPING_SUBTOTAL_THRESHOLD;
  const shippingDiscountTiers = shippingSettings.shippingDiscountTiers ?? [];

  const items = Array.isArray(cart_products) ? cart_products : [];
  const productLevelSavings = items.reduce((sum, item) => {
    const base = Number(item.basePrice ?? item.finalPriceDiscount ?? 0);
    const final = Number(item.finalPriceDiscount ?? 0);
    const qty = Number(item.orderQuantity ?? 0);
    if (base > final && qty > 0) {
      return sum + (base - final) * qty;
    }
    return sum;
  }, 0);
  const originalSubtotal = subtotal + productLevelSavings;
  const productLevelPercent =
    originalSubtotal > 0 && productLevelSavings > 0
      ? Math.round((productLevelSavings / originalSubtotal) * 100)
      : 0;
  const appliedCouponCode =
    items.find((i) => i.appliedCouponCode)?.appliedCouponCode ?? couponCode;
  const appliedCouponPercentage =
    items.find((i) => i.appliedCouponPercentage != null)?.appliedCouponPercentage ?? null;

  /**
   * Shipping before any tier discount: a flat charge, not the per-item
   * `shipping.price` this used to add up. The server bills the flat figure,
   * and a cart that quotes anything else is quoting a number the receipt will
   * contradict.
   */
  const shippingFromCart = items.length > 0 ? FLAT_SHIPPING_COST : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  /**
   * Free shipping is earned on what is actually paid, after every discount —
   * mirrors resolveShippingCost in the backend. A coupon that pulls a 600 cart
   * down to 450 leaves a 450 order, and a 450 order pays shipping.
   */
  const freeShippingBasis = subtotalAfterDiscount;
  const qualifiesForFreeShipping =
    freeShippingBasis >= freeShippingUnlockThreshold;

  let effectiveShippingCost: number;
  let shippingDiscountPercent: number | null = null;
  if (qualifiesForFreeShipping) {
    effectiveShippingCost = 0;
  } else if (
    Array.isArray(shippingDiscountTiers) &&
    shippingDiscountTiers.length > 0 &&
    quantity > 0
  ) {
    const sorted = [...shippingDiscountTiers].sort(
      (a, b) => b.minItems - a.minItems
    );
    const tier = sorted.find((t) => quantity >= t.minItems);
    if (tier) {
      shippingDiscountPercent = tier.discountPercent;
      const discounted =
        shippingFromCart * (1 - tier.discountPercent / 100);
      effectiveShippingCost = Math.round(discounted * 100) / 100;
    } else {
      effectiveShippingCost = shippingFromCart;
    }
  } else {
    effectiveShippingCost = shippingFromCart;
  }
  const displayTotal = subtotalAfterDiscount + effectiveShippingCost;
  const gapToFreeShipping =
    !qualifiesForFreeShipping &&
    freeShippingBasis < freeShippingUnlockThreshold
      ? Math.ceil(freeShippingUnlockThreshold - freeShippingBasis)
      : null;
  const progressPercent =
    freeShippingUnlockThreshold > 0
      ? Math.min(
          100,
          Math.round((freeShippingBasis / freeShippingUnlockThreshold) * 100)
        )
      : 100;

  const fetchShippingSettings = useCallback(() => {
    getStoreShippingSettings()
      .then((s) =>
        setShippingSettings({
          freeShippingThreshold: s.freeShippingThreshold ?? null,
          shippingDiscountTiers: s.shippingDiscountTiers ?? [],
        })
      )
      .catch(() =>
        setShippingSettings({
          freeShippingThreshold: null,
          shippingDiscountTiers: [],
        })
      );
  }, []);

  useEffect(() => {
    fetchShippingSettings();
  }, [fetchShippingSettings]);

  const prevRefetchWhen = useRef(false);
  useEffect(() => {
    if (refetchWhen && !prevRefetchWhen.current) {
      fetchShippingSettings();
    }
    prevRefetchWhen.current = refetchWhen ?? false;
  }, [refetchWhen, fetchShippingSettings]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShippingSettings();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchShippingSettings]);

  const autoApplyPercent =
    isAutoApplied && subtotal > 0 && discountAmount > 0
      ? Math.round((discountAmount / subtotal) * 100)
      : 0;

  return {
    subtotal,
    subtotalAfterDiscount,
    discountAmount,
    couponCode,
    isAutoApplied,
    autoApplyPercent,
    productLevelSavings,
    productLevelPercent,
    appliedCouponCode,
    appliedCouponPercentage,
    shippingFromCart,
    qualifiesForFreeShipping,
    effectiveShippingCost,
    displayTotal,
    gapToFreeShipping,
    freeShippingThreshold,
    progressPercent,
    quantity,
    shippingDiscountPercent,
  };
}
