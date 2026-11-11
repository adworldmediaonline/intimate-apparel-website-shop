'use client';

import { useState } from 'react';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { useCartSummary } from '@/hooks/use-cart-summary';
import CheckoutOrderArea from './checkout-order-area';

/**
 * The order summary as one line, opened on demand.
 *
 * On the billing and payment steps the full summary pushed the form most of
 * a screen down — the shopper came to type an address and had to scroll past
 * prices to reach the first field. Collapsed by default here; step 1 still
 * shows the full summary, because there it IS the content.
 *
 * The collapsed row keeps what someone actually checks mid-checkout: how
 * much they saved, how many items, and what they will pay.
 */
export default function CheckoutSummaryBar({ checkoutData, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const summary = useCartSummary();
  const { cart_products } = useSelector(state => state.cart);

  const itemCount = cart_products.reduce(
    (n, item) => n + (Number(item?.orderQuantity) || 1),
    0
  );

  const money = value =>
    `${CURRENCY_SYMBOL}${(Number(value) || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // What they would have paid at full price, against what they will pay.
  const saved = Number(summary.discountAmount) + Number(summary.productLevelSavings || 0);
  const payable = Number(summary.displayTotal) || 0;
  const struck = payable + saved;

  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls="checkout-summary-detail"
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
      >
        <ShoppingCart className="size-5 shrink-0 text-muted-foreground" aria-hidden />

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Order Summary
          </span>
          {saved > 0 && (
            <span className="mt-0.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
              {money(saved)} saved so far
            </span>
          )}
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-[11px] text-muted-foreground">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
          <span className="block text-sm">
            {saved > 0 && (
              <span className="mr-1 text-muted-foreground line-through">
                {money(struck)}
              </span>
            )}
            <span className="font-semibold text-foreground">{money(payable)}</span>
          </span>
        </span>

        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div id="checkout-summary-detail" className="border-t border-border">
          <CheckoutOrderArea checkoutData={checkoutData} variant="summary" />
        </div>
      )}
    </section>
  );
}
