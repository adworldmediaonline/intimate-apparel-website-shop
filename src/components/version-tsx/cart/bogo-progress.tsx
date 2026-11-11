'use client';

import type { BogoState } from '@/hooks/use-bogo';

/**
 * The offer, shown as slots.
 *
 * A bare "buy 2 get 1 free" leaves the shopper counting their own basket.
 * Drawing the group — two paid slots and a free one, filling as items go in
 * — says both what the rule is and how close they are, which is the only
 * reason to put it in the drawer at all.
 */
/** Group size -> the slot that comes free. Beyond this, "Nth" will do. */
const ORDINALS: Record<number, string> = {
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
};

export function BogoProgress({ state }: { state: BogoState }) {
  if (!state.offer) return null;

  const { buyQuantity, freeQuantity } = state.offer;
  const groupSize = buyQuantity + freeQuantity;
  const filled = state.eligibleUnits % groupSize;
  // A complete group reads as full, not as an empty next one.
  const slotsFilled = state.eligibleUnits > 0 && filled === 0 ? groupSize : filled;

  const headline =
    state.offer.headline ||
    `Buy ${buyQuantity}, get ${freeQuantity} free`;

  // "the next one" made the shopper count their own basket. Naming the slot
  // — third, fourth — says exactly which item comes free.
  const ordinal = ORDINALS[groupSize] ?? `${groupSize}th`;

  return (
    <div className="rounded-xl border border-[var(--wf-accent)] bg-[var(--wf-cream-2)] p-4 text-[var(--wf-ink)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--wf-ink-soft)]">
            {state.freeUnits > 0 ? 'Offer applied' : 'Add to unlock'}
          </p>
          <p className="text-lg font-semibold leading-tight">{headline}</p>
        </div>
        {/* No money in this badge. The saving is named once, on the item
            that is actually free and in the order summary; repeating it
            here as a third figure made the card read like a receipt. */}
        {state.freeUnits > 0 && (
          <span className="shrink-0 rounded-full bg-[var(--wf-sale)] px-3 py-1 text-xs font-bold text-white">
            {state.freeUnits} FREE
          </span>
        )}
      </div>

      {/* One box per slot in the group: paid, paid, FREE. */}
      <div className="mt-3 flex items-center gap-2">
        {Array.from({ length: groupSize }).map((_, i) => {
          const isFreeSlot = i >= buyQuantity;
          const isFilled = i < slotsFilled;
          return (
            <div
              key={i}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-bold ${
                isFilled
                  ? 'bg-[var(--wf-deep)] text-[var(--wf-cream)]'
                  : isFreeSlot
                    ? 'border border-dashed border-[var(--wf-deep)]/45 text-[var(--wf-deep)]/70'
                    : 'border border-dashed border-[var(--wf-deep)]/25 text-[var(--wf-deep)]/50'
              }`}
            >
              {isFreeSlot ? 'FREE' : i + 1}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm">
        {state.freeUnits > 0 ? (
          <>
            <strong>
              {state.freeUnits} item{state.freeUnits === 1 ? '' : 's'} free
            </strong>{' '}
            — the cheapest {state.freeUnits === 1 ? 'one is' : 'ones are'} on us.
          </>
        ) : (
          /* Counting to the end of the group told a shopper with one item
             to "add 2 more", which counted the free one as something to
             buy. This counts to what must actually be paid for. */
          state.nextIsFree ? (
            <>
              Your next one is <strong>FREE</strong>.
            </>
          ) : (
            <>
              Add{' '}
              <strong>
                {state.toQualify === 1 ? 'one more' : `${state.toQualify} more`}
              </strong>{' '}
              and {ordinal} one is <strong>FREE</strong>.
            </>
          )
        )}
      </p>
    </div>
  );
}

export default BogoProgress;
