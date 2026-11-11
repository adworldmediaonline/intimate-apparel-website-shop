'use client';

import { useAvailableCoupons } from '@/hooks/use-available-coupons';
import { Check, TagIcon } from 'lucide-react';

/**
 * The best available coupon, with an Apply button, in the drawer.
 *
 * Shown directly rather than behind a "view coupons" dialog: a code the
 * shopper has to go looking for is a code most of them never find. Only the
 * strongest offer is listed — a drawer is not the place for a catalogue of
 * them, and the checkout page still shows the full list.
 *
 * Sits after the offer card on purpose. The free item is decided first, and
 * the coupon then applies to what is actually being paid for.
 */
export function CartCouponRow() {
  const { coupons, applyingCode, apply, appliedCode } = useAvailableCoupons();

  // `coupons` is already sorted best-first with eligible ones ahead.
  const best = coupons[0];
  if (!best) return null;

  const isApplied = appliedCode === best.code;
  const isApplying = applyingCode === best.code;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--wf-accent)] bg-[var(--wf-cream-2)] p-3">
      <TagIcon className="size-4 shrink-0 text-[var(--wf-brand)]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {best.label} off with <span className="font-mono">{best.code}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {isApplied
            ? 'Applied to this order'
            : best.eligible
              ? best.title
              : `Spend ₹${best.minimumAmount} to use this`}
        </p>
      </div>

      {isApplied ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--wf-now)] px-3.5 py-2 text-xs font-bold text-white">
          <Check className="size-3" />
          Applied
        </span>
      ) : (
        <button
          type="button"
          onClick={() => apply(best.code)}
          disabled={!best.eligible || isApplying}
          className="shrink-0 rounded-lg bg-[var(--wf-brand)] px-3.5 py-2 text-xs font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isApplying ? 'Applying…' : 'Apply'}
        </button>
      )}
    </div>
  );
}

export default CartCouponRow;
