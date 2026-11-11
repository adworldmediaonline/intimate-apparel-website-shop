const EVENT_PATH = '/api/v2/shop-cart-add-intents/events';

export interface PostShopCartAddIntentPayload {
  sessionKey: string;
  productId: string;
  productTitle: string;
  productSku?: string;
  productSlug?: string;
  selectedOptionLabel?: string;
  configurationSummary?: string;
  quantityAdded: number;
  unitPriceAtAdd: number;
  cartLineQuantityAfter?: number;
  cartDistinctItemCountAfter?: number;
  clientSource?: string;
  pagePath?: string;
  userAgent?: string;
}

/**
 * Fire-and-forget POST to v2 analytics. Never throws to callers; failures are swallowed.
 */
export const postShopCartAddIntentEvent = async (
  body: PostShopCartAddIntentPayload
): Promise<void> => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base || !body.sessionKey || !body.productId) {
    return;
  }
  const url = `${base.replace(/\/$/, '')}${EVENT_PATH}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    /* storefront must keep working if analytics fails */
  }
};
