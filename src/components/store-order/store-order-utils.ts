import type {
  StoreOrderDocument,
  StoreOrderShippingDetails,
} from '@/types/store-order';

export interface OrderDiscountBreakdown {
  firstTimeDiscountAmount: number;
  couponDiscounts: number;
  couponDisplayText: string;
  otherDiscounts: number;
}

export const computeOrderDiscountBreakdown = (
  order: StoreOrderDocument
): OrderDiscountBreakdown => {
  const cart = order.cart ?? [];
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.finalPriceDiscount ?? 0) * (item.orderQuantity ?? 1),
    0
  );

  let firstTimeDiscountAmount = 0;
  const ft = order.firstTimeDiscount;
  if (ft?.isApplied && ft.amount != null && ft.amount > 0) {
    firstTimeDiscountAmount = ft.amount;
  }

  let couponDiscounts = 0;
  let couponDisplayText = '';
  const appliedCoupons = order.appliedCoupons ?? [];
  const appliedCoupon = order.appliedCoupon;
  const discount = Number(order.discount ?? 0);

  if (appliedCoupons.length > 0) {
    couponDiscounts = appliedCoupons.reduce(
      (sum, coupon) =>
        sum + (coupon.discount || coupon.discountAmount || 0),
      0
    );
    if (appliedCoupons.length === 1) {
      const c = appliedCoupons[0];
      couponDisplayText = `${c.couponCode} (${c.title})`;
    } else {
      couponDisplayText = `${appliedCoupons.length} Coupons Applied`;
    }
  } else if (
    appliedCoupon != null &&
    ((appliedCoupon.discount ?? 0) > 0 ||
      (appliedCoupon.discountAmount ?? 0) > 0)
  ) {
    couponDiscounts =
      appliedCoupon.discount || appliedCoupon.discountAmount || 0;
    couponDisplayText = `${appliedCoupon.couponCode} (${appliedCoupon.title})`;
  }

  const otherDiscounts = Math.max(
    0,
    discount - firstTimeDiscountAmount - couponDiscounts
  );

  return {
    firstTimeDiscountAmount,
    couponDiscounts,
    couponDisplayText,
    otherDiscounts,
  };
};

export const computeCartSubtotal = (order: StoreOrderDocument): number => {
  const cart = order.cart ?? [];
  return cart.reduce(
    (sum, item) =>
      sum +
      Number(item.finalPriceDiscount ?? 0) * (item.orderQuantity ?? 1),
    0
  );
};

export type ShippingCarrierRow = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

export const getShippingCarriersFromDetails = (
  shippingDetails?: StoreOrderShippingDetails
): ShippingCarrierRow[] => {
  if (!shippingDetails) return [];
  if (
    shippingDetails.carriers &&
    Array.isArray(shippingDetails.carriers) &&
    shippingDetails.carriers.length > 0
  ) {
    return shippingDetails.carriers;
  }
  if (shippingDetails.carrier) {
    return [
      {
        carrier: shippingDetails.carrier,
        trackingNumber: shippingDetails.trackingNumber,
        trackingUrl: shippingDetails.trackingUrl,
      },
    ];
  }
  return [];
};
