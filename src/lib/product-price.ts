/**
 * Shared product pricing logic.
 * finalPriceDiscount is the ONLY field for final selling price. Do not use price.
 * Marked price = displayMarkedPrice when provided by enrichment (for strikethrough).
 */

export interface ProductPriceInput {
  finalPriceDiscount?: number;
  displayMarkedPrice?: number;
  hasDisplayDiscount?: boolean;
}

export interface ProductDisplayPrices {
  /** Final price to display (after all discounts) */
  finalPrice: number;
  /** Marked price (original base) - undefined when no discount to show */
  markedPrice: number | undefined;
  /** Whether to show marked price (strikethrough) */
  showMarkedPrice: boolean;
}

/**
 * Get display prices for a product.
 * Uses finalPriceDiscount only for final price. Do not use price field.
 * Uses displayMarkedPrice when provided (from server enrichment) for marked price.
 */
export function getProductDisplayPrices(
  product: ProductPriceInput,
  options?: { optionPrice?: number }
): ProductDisplayPrices {
  const optionPrice = options?.optionPrice ?? 0;

  // Final price = finalPriceDiscount only; product display discounts are field-managed.
  const mainPrice = Number(product.finalPriceDiscount ?? 0);
  const finalPrice = mainPrice + optionPrice;

  // Free products: no marked price.
  if (finalPrice === 0) {
    return {
      finalPrice: 0,
      markedPrice: undefined,
      showMarkedPrice: false,
    };
  }

  // Marked price = displayMarkedPrice when enrichment provides it (for strikethrough)
  const markedPrice =
    typeof product.displayMarkedPrice === "number"
      ? product.displayMarkedPrice + optionPrice
      : undefined;

  const showMarkedPrice =
    (product.hasDisplayDiscount ?? false) &&
    markedPrice != null &&
    markedPrice > finalPrice;

  return {
    finalPrice,
    markedPrice: showMarkedPrice ? markedPrice : undefined,
    showMarkedPrice,
  };
}

/**
 * Format price for display (2 decimals).
 */
export function formatPrice(value: number): string {
  return value.toFixed(2);
}

/**
 * Resolve unit price for cart item. Uses finalPriceDiscount only.
 * Add optionPrice when product has selected option.
 */
export function resolveCartItemPrice(
  product: { finalPriceDiscount?: number },
  optionPrice = 0
): number {
  const base = Number(product.finalPriceDiscount ?? 0);
  return Math.round((base + optionPrice) * 100) / 100;
}
