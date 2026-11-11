'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, TagIcon, XIcon } from 'lucide-react';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { useAvailableCoupons } from '@/hooks/use-available-coupons';

/**
 * "View coupons" — every coupon a shopper could use, with an Apply button.
 *
 * This exists alongside the single-coupon promo banner because that banner
 * only renders for coupons flagged `showInCheckoutPromo`, an opt-in that is
 * easy to leave unticked. A live coupon was then invisible at checkout with
 * nothing on screen to explain why. This list needs no flag: a public,
 * active coupon with a code is reachable here.
 *
 * Renders only when there is more than one coupon. The single best coupon
 * already has its own row with an Apply button directly above this, so with
 * one coupon in the account this said "View coupons · 1 available" about a
 * coupon that was on screen — a second tap to reach what was already there.
 */
export default function CheckoutCouponList({ disabled = false }) {
  const { coupons, isLoading, applyingCode, apply, appliedCode } =
    useAvailableCoupons();
  const [open, setOpen] = useState(false);

  // Escape closes, and the page behind must not scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = event => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (isLoading || coupons.length < 2) return null;

  const handleApply = async code => {
    const ok = await apply(code);
    if (ok) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
      >
        <span className="flex items-center gap-2.5">
          <TagIcon className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="text-sm font-semibold text-foreground">
            View coupons
          </span>
        </span>
        <span className="text-xs font-medium text-primary">
          {coupons.length} available
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="bg-card max-h-[80vh] w-full overflow-y-auto rounded-t-2xl p-4 sm:max-w-md sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-list-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 id="coupon-list-title" className="text-base font-semibold">
                Available coupons
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close coupons"
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <ul className="space-y-2.5">
              {coupons.map(coupon => {
                const isApplied = appliedCode === coupon.code;
                const isApplying = applyingCode === coupon.code;
                return (
                  <li
                    key={coupon.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-bold tracking-wide text-primary">
                          {coupon.code}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {coupon.title}
                        </p>
                        {coupon.description && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {coupon.description}
                          </p>
                        )}
                        {/* Stated plainly rather than hiding the coupon: a
                            shopper may well add another item for it. */}
                        {!coupon.eligible && (
                          <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            Spend {CURRENCY_SYMBOL}
                            {coupon.minimumAmount.toFixed(0)} or more to use this
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApply(coupon.code)}
                        disabled={isApplied || isApplying || !coupon.eligible}
                        className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        {isApplied ? (
                          <span className="flex items-center gap-1">
                            <CheckIcon className="size-3.5" /> Applied
                          </span>
                        ) : isApplying ? (
                          'Applying…'
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
