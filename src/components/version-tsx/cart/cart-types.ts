/**
 * Cart item shape - used across cart drawer, cart page, checkout.
 */

export interface CartItemType {
  _id: string;
  slug?: string;
  title: string;
  img: string;
  sku?: string;
  price?: number | string;
  finalPriceDiscount?: number | string;
  orderQuantity: number;
  selectedOption?: { title: string; price: number };
  /** Product configurations (e.g. Rod Ends preference) - affects cart line identity */
  selectedConfigurations?: Record<
    number,
    { optionIndex: number; option: { name: string; price: number } }
  >;
  /** Custom notes for configs with enableCustomNote */
  customNotes?: Record<number, string>;
  shipping?: { price?: number };
  /** Original price before product-level discount (for savings display) */
  basePrice?: number;
  /** Server-enriched MRP, struck through on the line when it beats the price charged. */
  displayMarkedPrice?: number;
  /** Set by the same enrichment; without it `displayMarkedPrice` is not trusted. */
  hasDisplayDiscount?: boolean;
  /** Coupon code applied at product level (when auto apply) */
  appliedCouponCode?: string;
  /** Coupon percentage when auto-applied (for badge display) */
  appliedCouponPercentage?: number;
}

/**
 * Computed cart summary - from useCartSummary hook.
 */
export interface CartSummary {
  subtotal: number;
  subtotalAfterDiscount: number;
  discountAmount: number;
  couponCode: string | null;
  isAutoApplied: boolean;
  autoApplyPercent: number;
  /** Savings from product-level discount (when auto apply adds discounted prices) */
  productLevelSavings: number;
  productLevelPercent: number;
  /** Coupon code applied (from cart state or product-level) */
  appliedCouponCode: string | null | undefined;
  /** Coupon percentage when available (for badge display) */
  appliedCouponPercentage: number | null;
  shippingFromCart: number;
  qualifiesForFreeShipping: boolean;
  effectiveShippingCost: number;
  displayTotal: number;
  gapToFreeShipping: number | null;
  freeShippingThreshold: number | null;
  progressPercent: number;
  /** When a shipping discount tier is applied (e.g. 50) */
  shippingDiscountPercent: number | null;
}
