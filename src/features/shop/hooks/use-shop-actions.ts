'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { resolveCartItemPrice } from '@/lib/product-price';
import { isOutOfStock } from '@/lib/product-stock';

import type { ShopProduct, AddToCartProduct } from '../shop-types';
import type { ProductBase } from '@/types/product';

interface SelectedOption {
  title: string;
  price: number;
}

export const useShopActions = () => {
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state: any) => state.cart);
  const [fetchProduct] = useLazyGetProductQuery();

  const handleAddToCart = useCallback(
    async (product: AddToCartProduct, selectedOption?: SelectedOption) => {
      if (product.options && product.options.length > 0 && !selectedOption) {
        notifyError(
          'Please select an option before adding the product to your cart.'
        );
        return;
      }

      // Re-fetch product to validate stock (handles stale page when another user bought last item)
      let validatedQuantity: number | undefined;
      try {
        const result = await fetchProduct(product._id);
        if (result.error || !result.data) {
          notifyError('Unable to verify product availability. Please try again.');
          return;
        }
        const freshProduct = result.data;
        if (isOutOfStock(freshProduct)) {
          notifyError('This product is out of stock.');
          return;
        }
        validatedQuantity = Number(freshProduct?.quantity ?? 0);
        const existingProduct = cart_products.find(
          (item: any) => item._id === product._id
        );
        const optionChanged =
          existingProduct &&
          JSON.stringify(existingProduct.selectedOption) !==
          JSON.stringify(selectedOption);
        const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
        const finalQuantity = optionChanged ? currentQty : currentQty + 1;

        if (validatedQuantity < finalQuantity) {
          notifyError(
            `Sorry, only ${validatedQuantity} items available. ${existingProduct
              ? `You already have ${currentQty} in your cart.`
              : ''}`
          );
          return;
        }
      } catch {
        notifyError('Unable to verify product availability. Please try again.');
        return;
      }

      const existingProduct = cart_products.find(
        (item: any) => item._id === product._id
      );
      const optionChanged =
        existingProduct &&
        JSON.stringify(existingProduct.selectedOption) !==
        JSON.stringify(selectedOption);
      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
      const finalQuantity = optionChanged ? currentQty : currentQty + 1;

      const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
      const finalPrice = resolveCartItemPrice(product, optionPrice);

      const cartProduct = {
        _id: product._id,
        title: product.title,
        img: (product as any).image?.url ?? product.imageURLs?.[0] ?? product.img ?? '',
        finalPriceDiscount: finalPrice,
        orderQuantity: 1,
        quantity: validatedQuantity ?? product.quantity,
        slug: product.slug,
        shipping: product.shipping || { price: 0 },
        sku: product.sku ?? product._id ?? '',
        selectedOption: selectedOption,
        basePrice: Number((product as { basePrice?: number }).basePrice ?? product.displayMarkedPrice ?? product.finalPriceDiscount ?? 0),
        appliedCouponCode: (product as { appliedCouponCode?: string }).appliedCouponCode,
        appliedCouponPercentage: (product as { appliedCouponPercentage?: number }).appliedCouponPercentage,
      };

      dispatch(add_cart_product(cartProduct));

      // Cart confirmation modal will handle user feedback - no toast needed
    },
    [cart_products, dispatch, fetchProduct]
  );

  const handleAddToWishlist = useCallback(
    (product: ProductBase | ShopProduct) => {
      const wishlistProduct = {
        _id: product._id,
        title: product.title,
        img: (product as any).image?.url ?? product.imageURLs?.[0] ?? product.img ?? '',
        price: product.price,
        category: product.category,
        slug: product.slug,
        sku: product.sku,
        finalPriceDiscount: product.finalPriceDiscount,
        updatedPrice: product.updatedPrice,
        quantity: product.quantity,
        shipping: product.shipping || { price: 0 },
        // Preserve option and configuration data if they exist
        selectedOption: (product as any).selectedOption || undefined,
        options: (product as any).options || undefined,
        productConfigurations: (product as any).productConfigurations || undefined,
      };

      dispatch(add_to_wishlist(wishlistProduct));
      notifySuccess(`${product.title} added to wishlist`);
    },
    [dispatch]
  );

  return {
    handleAddToCart,
    handleAddToWishlist,
  } as const;
};

