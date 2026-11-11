'use client';

import Link from 'next/link';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { useBogo } from '@/hooks/use-bogo';
import {
  OrderSummaryCard,
  AutoApplySavingsBanner,
} from '@/components/version-tsx/cart';

export default function CartCheckout() {
  const summary = useCartSummary();
  // Same offer the drawer and checkout price. Left out here, this card was
  // the one page quoting a total the backend would not charge.
  const bogo = useBogo();

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-4 border-b pb-4">
        <h3 className="text-xl font-bold">Order Summary</h3>
      </div>

      {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
        (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
        <div className="mb-4">
          <AutoApplySavingsBanner
            percent={
              summary.appliedCouponPercentage ??
              (summary.productLevelSavings > 0
                ? summary.productLevelPercent
                : summary.autoApplyPercent)
            }
            couponCode={summary.appliedCouponCode ?? summary.couponCode}
          />
        </div>
      )}


      <OrderSummaryCard
        variant="inline"
        subtotal={summary.subtotal}
        discountAmount={summary.discountAmount}
        couponCode={summary.couponCode}
        effectiveShippingCost={summary.effectiveShippingCost}
        qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
        bogoDiscount={bogo.discount}
        bogoLabel={bogo.offer?.name}
        displayTotal={Math.max(0, summary.displayTotal - bogo.discount)}
        isAutoApplied={summary.isAutoApplied}
        shippingDiscountPercent={summary.shippingDiscountPercent}
      />

      <div className="mt-6">
        <Link
          href="/checkout"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-md py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
