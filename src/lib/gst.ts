/**
 * GST extracted from a tax-inclusive total, for display.
 *
 * Mirrors `backend/lib/order-tax.js`. Kept deliberately small and in step
 * with it: the checkout shows this before an order exists, so it cannot ask
 * the API for the figures, but the two must agree to the paisa or the
 * invoice will contradict the checkout the customer saw.
 */

export const GST_RATE = 0.05;

/** Labels derived from the rate, so changing it is one edit. */
const trimPercent = (value: number) =>
  String(Number(value.toFixed(2))).replace(/\.0+$/, '');
export const GST_PERCENT_LABEL = `${trimPercent(GST_RATE * 100)}%`;
export const GST_HALF_LABEL = `${trimPercent((GST_RATE * 100) / 2)}%`;
export const CGST_LABEL = `CGST (${GST_HALF_LABEL})`;
export const SGST_LABEL = `SGST (${GST_HALF_LABEL})`;

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export interface GstBreakdown {
  basePrice: number;
  gst: number;
  cgst: number;
  sgst: number;
  total: number;
}

/**
 * @param total tax-inclusive amount charged for the goods (exclude shipping,
 *   which is not taxed here)
 */
export function gstBreakdownFromInclusive(total: number): GstBreakdown | null {
  const amount = Number(total);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const basePrice = round2(amount / (1 + GST_RATE));
  const gst = round2(amount - basePrice);
  // Halve the rounded GST rather than rounding each half, so the two
  // components always add back to exactly the tax charged.
  const cgst = round2(gst / 2);
  const sgst = round2(gst - cgst);

  return { basePrice, gst, cgst, sgst, total: round2(amount) };
}
