import type { Middleware, UnknownAction } from '@reduxjs/toolkit';

import { toAnalyticsItem, trackAddToCart } from '@/lib/analytics';
import { getCartItemId } from '@/lib/cart-item-id';
import { postShopCartAddIntentEvent } from '@/lib/shop-cart-intent/post-shop-cart-add-intent';
import { getOrCreateShopCartIntentSessionKey } from '@/lib/shop-cart-intent/session-key';

type CartLine = {
  _id: string;
  title: string;
  sku?: string;
  slug?: string;
  finalPriceDiscount?: number | string;
  price?: number | string;
  orderQuantity?: number;
  selectedOption?: { title: string; price: number };
  selectedConfigurations?: Record<
    number,
    { optionIndex: number; option: { name: string; price: number } }
  >;
  customNotes?: Record<number, string>;
};

/**
 * After a successful ::add_cart_product:: reducer run, records one v2 intent on the API.
 * Covers every dispatch site (cards, PDP, compare, legacy components) without touching each caller.
 */
export const shopCartAddIntentMiddleware: Middleware =
  store => next => action => {
    const act = action as UnknownAction;
    if (act.type !== 'cart/add_cart_product') {
      return next(action);
    }

    const prevLines = store.getState().cart.cart_products as CartLine[];
    const prevByKey = new Map(prevLines.map(line => [getCartItemId(line), line] as const));

    const result = next(action);

    if (typeof window === 'undefined') {
      return result;
    }

    const payload = act.payload as CartLine;
    const lineKey = getCartItemId(payload);
    const nextLines = store.getState().cart.cart_products as CartLine[];
    const prevLine = prevByKey.get(lineKey);
    const nextLine = nextLines.find(line => getCartItemId(line) === lineKey);

    const prevQty = prevLine ? Number(prevLine.orderQuantity) || 0 : 0;
    const nextQty = nextLine ? Number(nextLine.orderQuantity) || 0 : 0;
    const isNewLine = Boolean(!prevLine && nextLine);
    const increased = nextQty > prevQty;

    if (!isNewLine && !increased) {
      return result;
    }

    const quantityAdded = isNewLine ? Math.max(1, nextQty || 1) : nextQty - prevQty;

    const unitPriceAtAdd = Number(payload.finalPriceDiscount ?? payload.price ?? 0);

    let configurationSummary = '';
    if (payload.selectedConfigurations && Object.keys(payload.selectedConfigurations).length > 0) {
      try {
        configurationSummary = JSON.stringify(payload.selectedConfigurations).slice(0, 1900);
      } catch {
        configurationSummary = '';
      }
    }

    void postShopCartAddIntentEvent({
      sessionKey: getOrCreateShopCartIntentSessionKey(),
      productId: payload._id,
      productTitle: payload.title,
      productSku: String(payload.sku ?? ''),
      productSlug: String(payload.slug ?? ''),
      selectedOptionLabel: payload.selectedOption?.title ?? '',
      configurationSummary,
      quantityAdded,
      unitPriceAtAdd,
      cartLineQuantityAfter: nextQty,
      cartDistinctItemCountAfter: nextLines.length,
      clientSource: 'storefront',
      pagePath: window.location.pathname,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });

    // GA4 add_to_cart rides along here rather than in a middleware of its own:
    // ten components dispatch this action, and the quantity actually added
    // (new line vs. increment of an existing one) has already been worked out
    // above. Duplicating that elsewhere would only let the two drift apart.
    trackAddToCart(toAnalyticsItem(payload, quantityAdded));

    return result;
  };
