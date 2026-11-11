'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import useCartInfo from '@/hooks/use-cart-info';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { useCartActions } from '@/hooks/use-cart-actions';
import {
  CartDrawerHeader,
  CartEmptyState,
  CartItemCard,
  OrderSummaryCard,
  AutoApplySavingsBanner,
  getCartItemLineTotal,
  getCartItemProductHref,
} from '@/components/version-tsx/cart';
import BogoCrossSell from '@/components/version-tsx/cart/bogo-cross-sell';
import CartCouponRow from '@/components/version-tsx/cart/cart-coupon-row';
import BogoProgress from '@/components/version-tsx/cart/bogo-progress';
import { useBogo } from '@/hooks/use-bogo';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { ArrowRightIcon } from 'lucide-react';
import type { CartItemType } from '@/components/version-tsx/cart';

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart_products } = useSelector(
    (s: { cart: { cart_products: CartItemType[] } }) => s.cart
  );
  const { quantity } = useCartInfo();
  const summary = useCartSummary({ refetchWhen: open });
  const { handleIncrement, handleDecrement, handleRemove } = useCartActions();
  // Priced by the server, so the figure here is the figure charged.
  const bogo = useBogo(open);

  const items = Array.isArray(cart_products) ? cart_products : [];
  const drawerTotal = Math.max(0, summary.displayTotal - bogo.discount);

  const closeDrawer = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <CartDrawerHeader itemCount={quantity} />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <CartEmptyState onBrowseClick={closeDrawer} />
          ) : (
            <div className="space-y-3">
              <BogoProgress state={bogo} />
              {/* After the free item: the coupon applies to what is left
                  being paid for, so this is the order it is decided in. */}
              <CartCouponRow />
              {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
                (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
                <AutoApplySavingsBanner
                  percent={
                    summary.appliedCouponPercentage ??
                    (summary.productLevelSavings > 0
                      ? summary.productLevelPercent
                      : summary.autoApplyPercent)
                  }
                  couponCode={summary.appliedCouponCode ?? summary.couponCode}
                />
              )}
              {items.map((item, idx) => (
                <CartItemCard
                  key={`${item._id}-${idx}`}
                  item={item}
                  lineTotal={getCartItemLineTotal(item)}
                  freeUnits={bogo.freeByProduct[String(item._id)] ?? 0}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                  productHref={getCartItemProductHref}
                  onProductClick={closeDrawer}
                />
              ))}

              <BogoCrossSell
                state={bogo}
                inCartIds={items.map(i => String(i._id))}
                onNavigate={closeDrawer}
              />

              {/* The breakdown scrolls with everything else; only the total
                  and the button are pinned. Keeping all of it pinned took
                  half the drawer on a phone, so the items it describes were
                  the part that had to be scrolled to see. */}
              <div className="pt-2">
                <OrderSummaryCard
                  variant="sidebar"
                  subtotal={summary.subtotal}
                  discountAmount={summary.discountAmount}
                  couponCode={summary.couponCode}
                  effectiveShippingCost={summary.effectiveShippingCost}
                  qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
                  bogoDiscount={bogo.discount}
                  bogoLabel={bogo.offer?.name}
                  displayTotal={drawerTotal}
                  isAutoApplied={summary.isAutoApplied}
                  shippingDiscountPercent={summary.shippingDiscountPercent}
                  hideTotal
                />
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border/60 bg-muted/20 px-5 py-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-lg font-bold tabular-nums text-foreground">
                {CURRENCY_SYMBOL}
                {drawerTotal.toFixed(2)}
              </span>
            </div>

            <Button
              asChild
              className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg"
              size="lg"
            >
              <Link href="/checkout" onClick={closeDrawer}>
                Proceed to Checkout
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
