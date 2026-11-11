'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';
import { remove_wishlist_product } from '@/redux/features/wishlist-slice';
import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { quantityDecrement } from '@/redux/features/cartSlice';
import ProductCard from '@/components/version-tsx/product-card';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';

export default function ProfileWishlist() {
  const { wishlist } = useSelector((state: { wishlist: { wishlist: unknown[] } }) => state.wishlist);
  const dispatch = useDispatch();
  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  useEffect(() => {
    dispatch(get_wishlist_products());
  }, [dispatch]);

  const handleDecrementFromCart = (
    product: { _id: string; title: string; img?: string; quantity?: number; sku?: string; shipping?: { price?: number }; selectedOption?: { title: string; price: number }; finalPriceDiscount?: number }
  ) => {
    const cartProduct = {
      _id: product._id,
      title: product.title,
      img: product.img ?? '',
      finalPriceDiscount: product.finalPriceDiscount ?? 0,
      orderQuantity: 1,
      quantity: product.quantity ?? 1,
      sku: product.sku ?? product._id ?? '',
      shipping: product.shipping ?? { price: 0 },
      selectedOption: product.selectedOption,
    };
    dispatch(quantityDecrement(cartProduct as Parameters<typeof quantityDecrement>[0]));
  };

  const handleRemoveFromWishlist = ({ id, title }: { id: string; title: string }) => {
    dispatch(remove_wishlist_product({ id, title }));
  };

  const items = (wishlist || []) as Array<{
    _id: string;
    title: string;
    img?: string;
    slug?: string;
    sku?: string;
    price?: number;
    quantity?: number;
    finalPriceDiscount?: number;
    shipping?: { price?: number };
    category?: { name: string; id?: string };
    status?: string;
    selectedOption?: { title: string; price: number };
    options?: Array<{ title: string; price: number }>;
    [key: string]: unknown;
  }>;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Save your favorite items to your wishlist and come back to them later.
          </p>
          <Button asChild>
            <Link href="/shop" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Start Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Saved Items
            </CardTitle>
            <CardDescription>
              {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/wishlist" className="flex items-center gap-2">
              View full wishlist
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {items.slice(0, 5).map((item) => (
              <div key={item._id} className="py-4 first:pt-0 last:pb-0">
                <ProductCard
                  product={item as import('@/types/product').ProductBase}
                  variant="wishlist"
                  layout="horizontal"
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onDecrementFromCart={handleDecrementFromCart as (product: import('@/types/product').ProductBase & { finalPriceDiscount?: number; selectedOption?: { title: string; price: number } }) => void}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              </div>
            ))}
          </div>
          {items.length > 5 && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button asChild variant="outline" className="w-full">
                <Link href="/wishlist" className="flex items-center justify-center gap-2">
                  View all {items.length} items
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
