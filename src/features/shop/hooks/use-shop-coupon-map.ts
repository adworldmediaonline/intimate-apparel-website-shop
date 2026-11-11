'use client';

import { useEffect, useRef, useState } from 'react';
import { getCouponMapForProducts, type CouponMapEntry } from '@/lib/store-api';

type ProductForCoupon = { _id: string; price?: number; finalPriceDiscount?: number };

/**
 * @deprecated Shop page now uses server-side enrichment. Products arrive with
 * displayPrice/displayMarkedPrice pre-computed. This hook is no longer used.
 *
 * Pre-fetches coupon data for all products in one batch.
 * Returns a map and isReady. Only render product cards when isReady to avoid price flicker.
 * On load-more, fetches for new products only and merges (keeps isReady true).
 */
export function useShopCouponMap(
  products: ProductForCoupon[]
): { couponMap: Record<string, CouponMapEntry>; isReady: boolean } {
  const [state, setState] = useState<{
    couponMap: Record<string, CouponMapEntry>;
    isReady: boolean;
  }>({ couponMap: {}, isReady: false });

  const productIdsRef = useRef<Set<string>>(new Set());
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (products.length === 0) {
      setState({ couponMap: {}, isReady: true });
      productIdsRef.current = new Set();
      return;
    }

    const currentIds = new Set(products.map((p) => p._id));
    const prevIds = productIdsRef.current;
    const isInitialLoad = prevIds.size === 0;
    const newProducts = products.filter((p) => !prevIds.has(p._id));

    if (isInitialLoad) {
      setState((prev) => ({ ...prev, isReady: false }));
    }

    productIdsRef.current = currentIds;

    if (newProducts.length === 0 && !isInitialLoad) {
      return;
    }

    const toFetch = isInitialLoad ? products : newProducts;
    const thisFetchId = ++fetchIdRef.current;

    const applyResult = () => {
      if (thisFetchId !== fetchIdRef.current) return;
      setState((prev) => ({ ...prev, isReady: true }));
    };

    getCouponMapForProducts(toFetch)
      .then((fetchedMap) => {
        if (thisFetchId !== fetchIdRef.current) return;
        setState((prev) => ({
          couponMap: { ...prev.couponMap, ...fetchedMap },
          isReady: true,
        }));
      })
      .catch(() => {
        applyResult();
      });

    const timeoutId = setTimeout(applyResult, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    products
      .map((p) => `${p._id}:${p.finalPriceDiscount ?? p.price ?? 0}`)
      .join(','),
  ]);

  return state;
}
