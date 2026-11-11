'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import type { OrderDiscountBreakdown } from './store-order-utils';
import type { StoreOrderDocument } from '@/types/store-order';

interface StoreOrderCouponAlertProps {
  order: StoreOrderDocument;
  breakdown: OrderDiscountBreakdown;
}

export const StoreOrderCouponAlert = ({
  order,
  breakdown,
}: StoreOrderCouponAlertProps) => {
  const appliedCoupons = order.appliedCoupons ?? [];
  const appliedCoupon = order.appliedCoupon;
  const hasMulti =
    appliedCoupons.length > 0 ||
    (appliedCoupon != null &&
      ((appliedCoupon.discount ?? 0) > 0 ||
        (appliedCoupon.discountAmount ?? 0) > 0));

  if (!hasMulti) return null;

  return (
    <Alert className="mb-8 border-green-200 bg-green-50">
      <CheckCircle className="h-5 w-5 text-green-600" aria-hidden />
      <AlertDescription className="text-green-800">
        {appliedCoupons.length > 0 ? (
          appliedCoupons.length === 1 ? (
            <div className="text-center">
              <h3 className="font-semibold mb-2">Coupon Applied Successfully!</h3>
              <p className="text-sm">
                <strong>{appliedCoupons[0].couponCode}</strong> —{' '}
                {appliedCoupons[0].title}
                <br />
                <span className="text-xs">
                  You saved ₹
                  {(
                    appliedCoupons[0].discount ||
                    appliedCoupons[0].discountAmount ||
                    0
                  ).toFixed(2)}{' '}
                  on this order!
                </span>
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-semibold mb-2">
                {appliedCoupons.length} Coupons Applied Successfully!
              </h3>
              <div className="text-sm">
                {appliedCoupons.map((coupon, index) => (
                  <div key={index} className="mb-1">
                    <strong>{coupon.couponCode}</strong> — {coupon.title}
                  </div>
                ))}
                <div className="font-bold mt-2">
                  Total savings: {CURRENCY_SYMBOL}{breakdown.couponDiscounts.toFixed(2)}!
                </div>
              </div>
            </div>
          )
        ) : (
          appliedCoupon && (
            <div className="text-center">
              <h3 className="font-semibold mb-2">Coupon Applied Successfully!</h3>
              <p className="text-sm">
                <strong>{appliedCoupon.couponCode}</strong> —{' '}
                {appliedCoupon.title}
                <br />
                <span className="text-xs">
                  You saved ₹
                  {(
                    appliedCoupon.discount ||
                    appliedCoupon.discountAmount ||
                    0
                  ).toFixed(2)}{' '}
                  on this order!
                </span>
              </p>
            </div>
          )
        )}
      </AlertDescription>
    </Alert>
  );
};
