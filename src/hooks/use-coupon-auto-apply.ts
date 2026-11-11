'use client';

import { useCallback } from 'react';
import { clearUserRemoved } from '@/lib/coupon-user-removed';

/**
 * Product pricing is field-managed now, so this hook does not change prices.
 * This hook still exposes retryAutoApply for components that reference it.
 */
export function useCouponAutoApply() {
  const retryAutoApply = useCallback(() => {
    clearUserRemoved();
  }, []);

  return { retryAutoApply };
}
