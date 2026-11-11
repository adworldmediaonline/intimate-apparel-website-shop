'use client';

import { CheckCircle2Icon } from 'lucide-react';

import { CURRENCY_SYMBOL } from '@/lib/brand';

export interface AutoApplySavingsBannerProps {
  percent: number;
  /** Coupon code or name when available */
  couponCode?: string | null;
  /** Rupees off, when known. Shown beside the code on the second line. */
  savedAmount?: number | null;
}

export function AutoApplySavingsBanner({
  percent,
  couponCode,
  savedAmount,
}: AutoApplySavingsBannerProps) {
  const rawCode = couponCode?.trim();
  const displayCode = rawCode?.startsWith('checkout-promo:') ? null : rawCode;
  const amount = Number(savedAmount);
  const amountOff = Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : null;

  /*
    Leads with the saving, not with the mechanics.

    This used to headline "Discount applied successfully!" and push the
    number — the only part the shopper cares about — into grey subtext
    beneath it. The amount saved is now the headline, and the coupon code is
    the footnote; without a code there is no second line at all.

    Sizing is compact by default and roomier from `md` up: one line of text
    previously carried a 40px icon tile and 14px of padding, which made this
    the tallest row on a phone checkout.
  */
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 px-3 py-2 md:px-4 md:py-3.5">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 md:size-10 md:rounded-xl">
          <CheckCircle2Icon className="size-4 text-emerald-600 md:size-5 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-700 md:text-base dark:text-emerald-300">
            You saved {percent}% on this order
          </p>
          {/* One line carries the code and the rupee figure together. There
              used to be a second green card below this saying the same
              thing in different words — two confirmations of one discount
              read as two discounts. */}
          {(displayCode || amountOff) && (
            <p className="text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 text-sm">
              {displayCode ? `Coupon ${displayCode} applied` : 'Discount applied'}
              {amountOff && ` · ${CURRENCY_SYMBOL}${amountOff} off`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
