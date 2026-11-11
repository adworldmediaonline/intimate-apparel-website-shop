'use client';

import * as React from 'react';
import type { CouponMapEntry } from '@/lib/store-api';

type ShopCouponContextValue = {
  couponMap: Record<string, CouponMapEntry>;
  isReady: boolean;
};

const ShopCouponContext = React.createContext<ShopCouponContextValue | null>(
  null
);

export function ShopCouponProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ShopCouponContextValue;
}) {
  return (
    <ShopCouponContext.Provider value={value}>
      {children}
    </ShopCouponContext.Provider>
  );
}

export function useShopCoupon(productId: string): CouponMapEntry | null {
  const ctx = React.useContext(ShopCouponContext);
  if (!ctx) return null;
  return ctx.couponMap[productId] ?? null;
}

export function useShopCouponReady(): boolean {
  const ctx = React.useContext(ShopCouponContext);
  return ctx?.isReady ?? false;
}
