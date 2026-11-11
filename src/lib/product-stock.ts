/**
 * Quantity-only stock logic.
 * Out of stock = quantity is 0 or undefined. Single source of truth for purchase blocking.
 */

export function isOutOfStock(
  product: { quantity?: number | null } | null | undefined
): boolean {
  return (Number(product?.quantity) ?? 0) <= 0;
}

/**
 * Check if a configuration option is out of stock.
 * When quantity is null/undefined, option is not tracked - allow selection (backward compat).
 */
export function isOptionOutOfStock(
  option: { quantity?: number | null } | null | undefined
): boolean {
  if (option == null) return false;
  const qty = Number(option?.quantity);
  if (Number.isNaN(qty)) return false;
  return qty <= 0;
}

/**
 * Paused in the admin: deliberately switched off, not a stock level. Shown on
 * the storefront but greyed out, so a shopper can see the size exists.
 */
export function isOptionPaused(
  option: { isPaused?: boolean } | null | undefined
): boolean {
  return Boolean(option?.isPaused);
}

/** Cannot be bought right now, for either reason. */
export function isOptionUnavailable(
  option: { quantity?: number | null; isPaused?: boolean } | null | undefined
): boolean {
  return isOptionPaused(option) || isOptionOutOfStock(option);
}

/**
 * Get available quantity for a product with selected configuration options.
 * Returns min of selected option quantities when options have quantity defined.
 * Returns null when no option-level quantity (use product-level quantity).
 */
export function getConfigOptionAvailableQuantity(
  product: unknown,
  selectedConfigurations: Record<number, { optionIndex: number }> | undefined
): number | null {
  const p = product as { productConfigurations?: Array<{ enableCustomNote?: boolean; options?: Array<{ quantity?: number | null }> }> } | null | undefined;
  if (!p?.productConfigurations?.length || !selectedConfigurations || Object.keys(selectedConfigurations).length === 0) {
    return null;
  }
  const quantities: number[] = [];
  for (const configIndexStr of Object.keys(selectedConfigurations)) {
    const configIndex = Number(configIndexStr);
    const config = p.productConfigurations?.[configIndex];
    if (config?.enableCustomNote || !config?.options?.length) continue;
    const sel = selectedConfigurations[configIndex];
    if (sel == null) continue;
    const option = config.options[sel.optionIndex] as { quantity?: number | null } | undefined;
    if (!option) continue;
    const qty = option.quantity;
    if (qty !== null && qty !== undefined && !Number.isNaN(Number(qty))) {
      quantities.push(Number(qty));
    }
  }
  if (quantities.length === 0) return null;
  return Math.min(...quantities);
}
