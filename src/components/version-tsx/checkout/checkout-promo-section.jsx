'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { useState } from 'react';
import { Check, Gift, PartyPopper, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Admin-managed promo section shown in the order summary.
// `slot` controls what this instance renders:
//   - "banner"  (default): the apply UI + success popup (shown below the Total until applied)
//   - "applied": only the confirmation box (shown up top once applied)
// Render a "banner" instance and an "applied" instance in different spots; only the
// "banner" one owns the popup so it never shows twice.
export default function CheckoutPromoSection({
  orderTotal = 0,
  applied = false,
  onApply,
  disabled = false,
  slot = 'banner',
  promoLabel = '10%',
  promoTitle,
  promoDescription,
  savedAmount,
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  const displaySavedAmount = Number(savedAmount ?? 0) || 0;

  const handleApply = async () => {
    if (applied || disabled) return;
    const didApply = await onApply?.();
    if (didApply !== false) {
      setShowSuccess(true);
    }
  };

  // Confirmation-only instance: just the applied box, no banner/popup.
  if (slot === 'applied') {
    return applied ? (
      <AppliedState
        savedAmount={displaySavedAmount}
        promoLabel={promoLabel}
        promoTitle={promoTitle}
      />
    ) : null;
  }

  return (
    <div className={applied ? '' : 'mt-6'}>
      {/* Once applied, the confirmation box is shown up top (slot="applied"), so the
          banner here is hidden — but the component stays mounted to keep the popup alive. */}
      {!applied && (
        <PromoBanner
          applied={applied}
          disabled={disabled}
          onApply={handleApply}
          promoLabel={promoLabel}
          promoTitle={promoTitle}
          promoDescription={promoDescription}
          savedAmount={displaySavedAmount}
        />
      )}

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <PartyPopper className="size-7 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-green-600 dark:text-green-400">
              {promoTitle || `Additional ${promoLabel} discount`} applied successfully!
            </DialogTitle>
            <DialogDescription className="text-base text-foreground">
              You saved <span className="font-semibold text-green-600 dark:text-green-400">{CURRENCY_SYMBOL}{displaySavedAmount.toFixed(2)}</span> on your order.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="mt-1 w-full rounded-md bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue to payment
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Gradient highlight banner */
function PromoBanner({
  applied,
  disabled,
  onApply,
  savedAmount,
  promoLabel,
  promoTitle,
  promoDescription,
}) {
  if (applied) {
    return (
      <AppliedState
        savedAmount={savedAmount}
        promoLabel={promoLabel}
        promoTitle={promoTitle}
      />
    );
  }
  const displayDescription =
    promoDescription || `Click here to get an additional ${promoLabel} discount.`;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[var(--wf-deep)] to-[var(--wf-brand)] p-4 text-white shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
        <Gift className="size-5" />
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
        {displayDescription}
      </p>
      <button
        type="button"
        onClick={onApply}
        disabled={disabled}
        className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[var(--wf-brand)] transition-colors hover:bg-white/90 disabled:opacity-50"
      >
        Apply
      </button>
    </div>
  );
}

/* Shared applied confirmation shown in place of the promo once applied */
function AppliedState({ savedAmount, promoLabel, promoTitle }) {
  const displayTitle = promoTitle || `Additional ${promoLabel} discount`;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
        <Check className="size-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
          {displayTitle} applied
        </p>
        <p className="text-xs text-green-600 dark:text-green-500">
          You saved {CURRENCY_SYMBOL}{savedAmount.toFixed(2)} on your order.
        </p>
      </div>
      <Sparkles className="size-4 shrink-0 text-green-500" />
    </div>
  );
}
