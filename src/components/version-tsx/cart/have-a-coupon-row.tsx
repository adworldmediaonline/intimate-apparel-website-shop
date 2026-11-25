'use client';

import { useRef, useState } from 'react';
import { Check, TagIcon, X } from 'lucide-react';

import { useAvailableCoupons } from '@/hooks/use-available-coupons';

/**
 * "Have a coupon?" — one line until it is clicked, then a box to type a code.
 *
 * The listed coupons cover the offers the shop is running, but a code handed
 * out by hand — a team code, a code from an email — appears on no list, and
 * until now there was nowhere to type one.
 *
 * Collapsed by default on purpose: an open, empty coupon box next to the
 * total reads as "everyone else got a discount and you did not", and talks
 * shoppers into leaving to go looking for one.
 *
 * The server decides whether the code is good. `apply` posts it, shows the
 * reason when it is refused, and puts it on the cart when it is not, so
 * nothing here needs to know the rules.
 */
export function HaveACouponRow() {
  const { apply, applyingCode, appliedCode } = useAvailableCoupons();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = code.trim().toUpperCase();
  const isApplying = applyingCode !== null;

  const submit = async () => {
    if (!trimmed || isApplying) return;
    const ok = await apply(trimmed);
    if (ok) {
      setCode('');
      setOpen(false);
    } else {
      // Left open with the code still in it: the message says what was wrong,
      // and retyping a code you just typed is a small insult.
      inputRef.current?.select();
    }
  };

  // Already discounted — the summary line shows which code, so this would
  // only invite replacing a working coupon with a worse one.
  if (appliedCode) {
    return (
      <p className="flex items-center gap-2 text-sm text-[var(--wf-now)]">
        <Check className="size-4 shrink-0" />
        Coupon <span className="font-mono font-semibold">{appliedCode}</span> applied
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          // Focus after paint, or the field is not in the document yet.
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--wf-line)] px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-[var(--wf-accent)]"
      >
        <TagIcon className="size-4 shrink-0 text-[var(--wf-brand)]" />
        <span className="flex-1">Have a coupon?</span>
        <span className="text-xs font-semibold text-[var(--wf-brand)]">Add</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--wf-accent)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <TagIcon className="size-4 shrink-0 text-[var(--wf-brand)]" />
        <span className="flex-1 text-sm font-medium">Enter your coupon code</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setCode('');
          }}
          aria-label="Close coupon entry"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={code}
          onChange={event => setCode(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
            if (event.key === 'Escape') setOpen(false);
          }}
          placeholder="UWH100"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-lg border border-[var(--wf-line)] bg-white px-3 py-2 font-mono text-sm uppercase tracking-wide outline-none focus:border-[var(--wf-brand)]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!trimmed || isApplying}
          className="shrink-0 rounded-lg bg-[var(--wf-brand)] px-4 py-2 text-xs font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isApplying ? 'Applying…' : 'Apply'}
        </button>
      </div>
    </div>
  );
}

export default HaveACouponRow;
