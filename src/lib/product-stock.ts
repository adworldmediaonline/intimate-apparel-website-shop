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

/**
 * Taken off the storefront: not listed, not selectable, not mentioned. Unlike
 * a paused option, which stays on the page greyed out, a hidden one is not
 * rendered at all — it is a colour or size the store no longer offers.
 *
 * The option is still in the product document, keeping its images and prices,
 * so it can come back without being rebuilt. Hidden options must never be
 * filtered out of `productConfigurations`: the cart keys a line on the option's
 * index, so removing one would renumber every option after it.
 */
export function isOptionHidden(
  option: { isHidden?: boolean } | null | undefined
): boolean {
  return Boolean(option?.isHidden);
}

/** Cannot be bought right now, for any reason. */
export function isOptionUnavailable(
  option:
    | { quantity?: number | null; isPaused?: boolean; isHidden?: boolean }
    | null
    | undefined
): boolean {
  return isOptionHidden(option) || isOptionPaused(option) || isOptionOutOfStock(option);
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
