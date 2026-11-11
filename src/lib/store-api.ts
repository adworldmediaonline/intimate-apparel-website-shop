/**
 * Storefront API - coupons, shipping settings.
 * Aligned with reference project patterns.
 */

import { cache } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type CouponBehaviorSettings = {
  autoApply: boolean;
  autoApplyStrategy: 'best_savings' | 'first_created' | 'highest_percentage' | 'customer_choice';
  showToastOnApply: boolean;
};

export type ShippingDiscountTier = {
  minItems: number;
  discountPercent: number;
};

export type ShippingSettings = {
  freeShippingThreshold: number | null;
  shippingDiscountTiers?: ShippingDiscountTier[];
};

/** Raw coupon from the backend */
export type RawCoupon = {
  _id: string;
  couponCode?: string;
  title?: string;
  description?: string;
  discountType: string;
  discountPercentage?: number;
  discountAmount?: number;
  minimumAmount?: number;
  applicableType?: string;
  applicableProducts?: Array<{ _id: string }>;
  status?: string;
  priority?: number;
  allowAutoApply?: boolean;
  showInCheckoutPromo?: boolean;
  isPublic?: boolean;
  createdAt?: string;
};

/** Normalized offer for UI (matches reference project shape) */
export type AvailableOffer = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number | null;
  discountAmount: number;
  description: string;
  allowAutoApply?: boolean;
  createdAt?: string | null;
  locked?: boolean;
};

/** Pick best offer by strategy for auto-apply */
export function pickBestOffer(
  offers: AvailableOffer[],
  strategy: 'best_savings' | 'first_created' | 'highest_percentage'
): AvailableOffer | null {
  const applicable = offers.filter((o) => !o.locked && (o.allowAutoApply !== false));
  if (applicable.length === 0) return null;

  if (strategy === 'best_savings') {
    return applicable.reduce((best, o) =>
      o.discountAmount > best.discountAmount ? o : best
    );
  }
  if (strategy === 'first_created') {
    return applicable.reduce((oldest, o) => {
      const oDate = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      const oldestDate = oldest.createdAt ? new Date(oldest.createdAt).getTime() : 0;
      return oDate < oldestDate ? o : oldest;
    });
  }
  if (strategy === 'highest_percentage') {
    const withPct = applicable.filter((o) => o.type === 'percentage');
    if (withPct.length > 0) {
      return withPct.reduce((best, o) => (o.value > best.value ? o : best));
    }
    return applicable.reduce((best, o) =>
      o.discountAmount > best.discountAmount ? o : best
    );
  }
  return applicable[0];
}

export type ValidateDiscountResult =
  | { valid: true; discountAmount: number; message?: string }
  | { valid: false; message: string };

async function getStoreCouponSettingsInternal(): Promise<CouponBehaviorSettings> {
  const res = await fetch(`${apiUrl}/api/store/settings/coupon`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch coupon settings");
  return res.json();
}

export const getStoreCouponSettings = cache(getStoreCouponSettingsInternal);

export async function getStoreShippingSettings(): Promise<ShippingSettings> {
  const res = await fetch(`${apiUrl}/api/store/settings/shipping`, {
    cache: 'no-store',
  });
  if (!res.ok) return { freeShippingThreshold: null, shippingDiscountTiers: [] };
  return res.json();
}

async function getActiveCouponsInternal(): Promise<RawCoupon[]> {
  const res = await fetch(`${apiUrl}/api/coupon/active`, {
    next: { revalidate: 300 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to fetch coupons");
  return Array.isArray(data?.data) ? data.data : [];
}

export const getActiveCoupons = cache(getActiveCouponsInternal);

/**
 * Map cart items to format expected by the backend validate endpoint.
 */
function toCartItemsForValidate(
  items: Array<{ productId?: string; _id?: string; quantity: number; unitPrice: number; title?: string }>
) {
  return items.map((i) => ({
    productId: i.productId ?? i._id,
    _id: i.productId ?? i._id,
    orderQuantity: i.quantity,
    finalPriceDiscount: i.unitPrice,
    price: i.unitPrice,
    title: i.title ?? '',
  }));
}

export async function validateStoreDiscount(
  code: string,
  subtotal: number,
  items: Array<{ productId: string; quantity: number; unitPrice: number; title?: string }>,
  options?: {
    customerEmail?: string;
    customerReferralCode?: string;
    cartTotal?: number;
    shippingCost?: number;
  }
): Promise<ValidateDiscountResult> {
  const cartItems = toCartItemsForValidate(
    items.map((i) => ({
      productId: i.productId,
      _id: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      title: i.title,
    }))
  );

  const res = await fetch(`${apiUrl}/api/coupon/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      couponCode: code.trim().toUpperCase(),
      cartItems,
      cartTotal: options?.cartTotal ?? subtotal,
      cartSubtotal: subtotal,
      shippingCost: options?.shippingCost ?? 0,
      // Needed by first-order-only coupons, which decide eligibility from
      // order history. `customerEmail` was already accepted here but never
      // forwarded, so the backend had no way to identify a guest.
      ...(options?.customerEmail
        ? { email: options.customerEmail.trim().toLowerCase() }
        : {}),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      valid: false,
      message: data.message ?? 'Invalid coupon',
    };
  }

  if (data.success && data.data?.discount != null) {
    return {
      valid: true,
      discountAmount: data.data.discount,
      message: data.message,
    };
  }

  return {
    valid: false,
    message: data.message ?? 'Invalid coupon',
  };
}

/**
 * Build offers for a single product from pre-fetched coupons (sync).
 * Used by getCouponMapForProducts for batched pre-fetch.
 * Exported for server-side enrichment.
 */
export function buildOffersForProduct(
  coupons: RawCoupon[],
  productId: string,
  unitPrice: number
): AvailableOffer[] {
  const productIds = new Set([productId]);
  const applicable = coupons.filter((c) => {
    if (!c.couponCode) return false;
    if (c.status !== 'active') return false;
    if (c.applicableType === 'all') return true;
    if (c.applicableType === 'product' && c.applicableProducts?.length) {
      return c.applicableProducts.some((p) =>
        productIds.has(typeof p === 'object' ? (p as { _id: string })._id : String(p))
      );
    }
    return true;
  });

  return applicable.map((c): AvailableOffer => {
    const code = c.couponCode ?? '';
    const type = c.discountType === 'fixed_amount' ? 'fixed' : 'percentage';
    const value = type === 'percentage' ? (c.discountPercentage ?? 0) : (c.discountAmount ?? 0);
    const discountAmount =
      type === 'percentage'
        ? Math.round(unitPrice * (value / 100) * 100) / 100
        : Math.min(value, unitPrice);

    return {
      code,
      type,
      value,
      minOrderAmount: c.minimumAmount ?? null,
      discountAmount,
      description: c.title ?? c.description ?? code,
      allowAutoApply: c.allowAutoApply ?? true,
      createdAt: c.createdAt ?? null,
    };
  });
}

export type CouponMapEntry = {
  hasCoupon: boolean;
  couponPercentage: number;
  couponCode: string | null;
};

/**
 * Pre-fetch coupon data for multiple products in one batch (2 API calls total).
 * Returns a map of productId -> coupon info. Use this to avoid per-card async fetches.
 */
export async function getCouponMapForProducts(
  products: Array<{ _id: string; price?: number; finalPriceDiscount?: number }>
): Promise<Record<string, CouponMapEntry>> {
  const settings = await getStoreCouponSettings();
  if (
    !settings.autoApply ||
    settings.autoApplyStrategy === 'customer_choice'
  ) {
    return {};
  }

  const coupons = await getActiveCoupons();
  const strategy = settings.autoApplyStrategy as
    | 'best_savings'
    | 'first_created'
    | 'highest_percentage';
  const map: Record<string, CouponMapEntry> = {};

  for (const p of products) {
    const unitPrice = Number(p.finalPriceDiscount || p.price || 0);
    if (unitPrice <= 0) {
      map[p._id] = { hasCoupon: false, couponPercentage: 0, couponCode: null };
      continue;
    }

    const offers = buildOffersForProduct(coupons, p._id, unitPrice);
    const best = pickBestOffer(offers, strategy);

    if (!best || best.discountAmount <= 0) {
      map[p._id] = { hasCoupon: false, couponPercentage: 0, couponCode: null };
      continue;
    }

    const couponPercentage =
      unitPrice > 0 ? Math.round((best.discountAmount / unitPrice) * 100) : 0;

    map[p._id] = {
      hasCoupon: true,
      couponPercentage,
      couponCode: best.code,
    };
  }

  return map;
}

/**
 * Get available offers for cart - filters active coupons that apply to cart items.
 * Returns normalized format for UI components.
 */
export async function getAvailableOffers(
  subtotal: number,
  items: Array<{ productId: string; quantity: number; unitPrice: number }>,
  _options?: { customerEmail?: string; customerReferralCode?: string }
): Promise<AvailableOffer[]> {
  const coupons = await getActiveCoupons();
  const productIds = new Set(items.map((i) => i.productId));

  const applicable = coupons.filter((c) => {
    if (!c.couponCode) return false;
    if (c.status !== 'active') return false;
    if (c.applicableType === 'all') return true;
    if (c.applicableType === 'product' && c.applicableProducts?.length) {
      return c.applicableProducts.some((p) =>
        productIds.has(typeof p === 'object' ? (p as { _id: string })._id : String(p))
      );
    }
    return true;
  });

  return applicable.map((c): AvailableOffer => {
    const code = c.couponCode ?? '';
    const type = c.discountType === 'fixed_amount' ? 'fixed' : 'percentage';
    const value = type === 'percentage' ? (c.discountPercentage ?? 0) : (c.discountAmount ?? 0);
    const discountAmount =
      type === 'percentage'
        ? Math.round(subtotal * (value / 100) * 100) / 100
        : Math.min(value, subtotal);

    return {
      code,
      type,
      value,
      minOrderAmount: c.minimumAmount ?? null,
      discountAmount,
      description: c.title ?? c.description ?? code,
      allowAutoApply: c.allowAutoApply ?? true,
      createdAt: c.createdAt ?? null,
    };
  });
}

/** What the storefront needs to know before a shopper commits to buying. */
export interface DeliveryEstimate {
  /** False when the lookup could not be made; show a generic window instead. */
  estimated: boolean;
  serviceable?: boolean;
  minDays?: number | null;
  maxDays?: number | null;
  cod?: boolean;
}

/**
 * Courier delivery estimate for a pincode.
 *
 * Fronts Shiprocket's serviceability API through our own public endpoint,
 * which caches per pincode so a product page cannot hammer the shared
 * courier quota. Returns `estimated: false` rather than throwing when the
 * lookup is unavailable, so the caller can fall back to a generic window.
 */
export async function getDeliveryEstimate(
  pincode: string
): Promise<DeliveryEstimate> {
  try {
    const res = await fetch(
      `${apiUrl}/api/delivery/estimate?pincode=${encodeURIComponent(pincode)}`
    );
    if (!res.ok) return { estimated: false };
    const body = await res.json();
    return body?.data ?? { estimated: false };
  } catch {
    return { estimated: false };
  }
}
