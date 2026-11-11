import type { CartItemType } from './cart-types';

/**
 * Get unit price for a cart item. Uses finalPriceDiscount only (no price fallback).
 */
export function getCartItemUnitPrice(item: CartItemType): number {
  return Number(item.finalPriceDiscount ?? 0);
}

/**
 * Compute line total for a cart item (price × quantity).
 * Rounds unit price to 2 decimals to avoid floating-point precision issues.
 */
export function getCartItemLineTotal(item: CartItemType): string {
  const rawPrice = getCartItemUnitPrice(item);
  const unitPrice = Math.round(rawPrice * 100) / 100;
  const qty = Number(item.orderQuantity || 0);
  const lineTotal = Math.round(unitPrice * qty * 100) / 100;
  return lineTotal.toFixed(2);
}

/**
 * Build product href from cart item.
 */
export function getCartItemProductHref(item: CartItemType): string {
  return `/product/${item.slug || item._id}`;
}
