'use client';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import { getConfigOptionAvailableQuantity } from '@/lib/product-stock';
import { notifyError } from '@/utils/toast';
import type { CartItemType } from '@/components/version-tsx/cart/cart-types';

/**
 * Reusable cart actions for increment, decrement, remove.
 * Use across cart drawer, cart page, and checkout.
 */
export function useCartActions() {
  const dispatch = useDispatch();
  const [fetchProduct] = useLazyGetProductQuery();

  const handleIncrement = useCallback(
    async (item: CartItemType) => {
      // Re-fetch product to validate stock (handles stale cart when another user bought remaining stock)
      let freshQuantity: number | undefined;
      try {
        const result = await fetchProduct(item._id);
        if (result.error || !result.data) {
          notifyError('Unable to verify product availability. Please try again.');
          return;
        }
        const freshProduct = result.data;
        const configOptionQty = getConfigOptionAvailableQuantity(
          freshProduct,
          item.selectedConfigurations
        );
        freshQuantity =
          configOptionQty != null
            ? configOptionQty
            : Number(freshProduct?.quantity ?? 0);
        const currentQty = Number(item.orderQuantity ?? 0);
        const requestedQty = currentQty + 1;
        if (freshQuantity < requestedQty) {
          notifyError(
            `This product is no longer available in the requested quantity. Only ${freshQuantity} item${freshQuantity !== 1 ? 's' : ''} available.`
          );
          return;
        }
      } catch {
        notifyError('Unable to verify product availability. Please try again.');
        return;
      }

      const itemWithQuantity = {
        ...item,
        finalPriceDiscount: item.finalPriceDiscount ?? item.price,
        sku: item.sku ?? item._id,
        quantity: freshQuantity ?? (item as { quantity?: number }).quantity,
      };
      dispatch(add_cart_product(itemWithQuantity as Parameters<typeof add_cart_product>[0]));
    },
    [dispatch, fetchProduct]
  );

  const handleDecrement = useCallback(
    (item: CartItemType) => {
      dispatch(
        quantityDecrement({
          ...item,
          finalPriceDiscount: item.finalPriceDiscount ?? item.price,
          sku: item.sku ?? item._id,
        } as Parameters<typeof quantityDecrement>[0])
      );
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (item: CartItemType) => {
      dispatch(
        remove_product({
          title: item.title,
          id: item._id,
          selectedOption: item.selectedOption,
          selectedConfigurations: item.selectedConfigurations,
          customNotes: item.customNotes,
        })
      );
    },
    [dispatch]
  );

  return { handleIncrement, handleDecrement, handleRemove };
}
