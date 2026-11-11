'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { quantityDecrement } from '@/redux/features/cartSlice';
import { remove_wishlist_product } from '@/redux/features/wishlist-slice';
import ProductCard from '@/components/version-tsx/product-card';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';

export default function WishlistArea() {
  const { wishlist } = useSelector((state: any) => state.wishlist);
  const dispatch = useDispatch();
  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  const handleDecrementFromCart = (product: any) => {
    const cartProduct = {
      ...product,
      orderQuantity: 1,
      quantity: product.quantity || 1,
      sku: product.sku ?? product._id ?? '',
      shipping: product.shipping || { price: 0 },
      selectedOption: product.selectedOption,
    };
    dispatch(quantityDecrement(cartProduct));
  };

  const handleRemoveFromWishlist = ({ id, title }: { id: string; title: string }) => {
    dispatch(remove_wishlist_product({ id, title }));
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Wishlist
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 lg:py-24">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Your Wishlist is Empty
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Save your favorite items to your wishlist and come back to
                  them later.
                </p>
                <Button asChild className="w-full">
                  <Link href="/shop" className="flex items-center gap-2">
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  My Wishlist
                </h1>
                <p className="text-lg text-muted-foreground">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}{' '}
                  saved
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wishlist Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Saved Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border px-4 sm:px-6">
                      {wishlist.map((item: any, i: number) => (
                        <div key={i} className="py-4 first:pt-4 last:pb-4">
                          <ProductCard
                            product={item}
                            variant="wishlist"
                            layout="horizontal"
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={handleAddToWishlist}
                            onDecrementFromCart={handleDecrementFromCart}
                            onRemoveFromWishlist={handleRemoveFromWishlist}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wishlist Actions Sidebar */}
              <div className="lg:col-span-1">
                <Card className="lg:sticky lg:top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full" size="lg">
                      <Link href="/cart" className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        View Cart
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Link href="/shop" className="flex items-center gap-2">
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
