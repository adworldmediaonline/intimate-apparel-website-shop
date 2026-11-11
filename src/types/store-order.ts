/**
 * Storefront order document returned by GET /api/store/order/:id (lean Mongo shape + app fields).
 * Kept permissive at boundaries; narrow in UI where needed.
 */
export interface StoreOrderCartItem {
  img?: string;
  title?: string;
  sku?: string;
  gtin?: string;
  selectedOption?: { title?: string; price?: number };
  orderQuantity?: number;
  finalPriceDiscount?: number;
}

export interface StoreOrderFreeGift {
  type?: string;
  title?: string;
  /** Optional — the customer may not have picked a size at checkout. */
  size?: string;
}

export interface StoreOrderShippingDetails {
  estimatedDelivery?: Date | string;
  shippedDate?: Date | string;
  carriers?: Array<{
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }>;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface StoreOrderDocument {
  _id?: string;
  name?: string;
  country?: string;
  city?: string;
  contact?: string;
  invoice?: string | number;
  orderId?: string;
  createdAt?: string;
  cart?: StoreOrderCartItem[];
  shippingCost?: number;
  discount?: number;
  totalAmount?: number;
  taxAmount?: number;
  paymentMethod?: string;
  /**
   * Part payment: the advance charged online at checkout. `totalAmount` is
   * still the whole order; `balanceDue` is collected in cash on delivery.
   */
  partialPayment?: {
    percent: number;
    paidAmount: number;
    balanceDue: number;
    balanceCollected?: boolean;
  };
  status?: string;
  email?: string;
  firstTimeDiscount?: {
    isApplied?: boolean;
    amount?: number;
    percentage?: number;
  };
  appliedCoupons?: Array<{
    couponCode?: string;
    title?: string;
    discount?: number;
    discountAmount?: number;
  }>;
  appliedCoupon?: {
    couponCode?: string;
    title?: string;
    discount?: number;
    discountAmount?: number;
  };
  paymentIntent?: {
    id?: string;
    currency?: string;
  };
  freeGift?: StoreOrderFreeGift;
  shippingDetails?: StoreOrderShippingDetails;
}

/** JSON body for successful storefront order lookup. */
export interface GetStoreOrderResponse {
  success: boolean;
  order: StoreOrderDocument | null;
  message?: string;
}
