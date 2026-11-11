'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import store from '@/redux/store';
import { clearCart } from '@/redux/features/cartSlice';
import { useCartActions } from '@/hooks/use-cart-actions';
import {
  CartEmptyState,
  CartItemCard,
  getCartItemLineTotal,
  getCartItemProductHref,
} from '@/components/version-tsx/cart';
import type { CartItemType } from '@/components/version-tsx/cart';
import CartCheckout from './cart-checkout';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type RootState = ReturnType<typeof store.getState>;

export default function CartArea() {
  const { cart_products } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const { handleIncrement, handleDecrement, handleRemove } = useCartActions();

  const items = Array.isArray(cart_products) ? (cart_products as CartItemType[]) : [];

  const handleClearCart = () => {
    dispatch(clearCart());
    setIsClearDialogOpen(false);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 h-[400px]">
            <CartEmptyState
              browseHref="/shop"
              title="Your Cart is Empty"
              description="Looks like you haven't added anything to your cart yet."
              ctaText="Continue Shopping"
            />
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground mt-1">
                  {cart_products.length}{' '}
                  {cart_products.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <AlertDialog
                open={isClearDialogOpen}
                onOpenChange={setIsClearDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear Cart
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will remove all items from your cart. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <CartItemCard
                      key={`${item._id}-${item.selectedOption?.title ?? ''}-${idx}`}
                      item={item}
                      lineTotal={getCartItemLineTotal(item)}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      onRemove={handleRemove}
                      productHref={getCartItemProductHref}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <CartCheckout />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
