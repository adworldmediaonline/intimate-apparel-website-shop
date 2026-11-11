'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { cloudinaryVariant } from '@/lib/product-image';
import { add_cart_product, initialOrderQuantity } from '@/redux/features/cartSlice';
import { useGetOfferCrossSellQuery } from '@/redux/features/offerApi';
import type { BogoState } from '@/hooks/use-bogo';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value));

type Suggestion = {
  _id: string;
  title?: string;
  img?: string;
  image?: string;
  price?: number;
  finalPriceDiscount?: number;
  imageURLs?: { img?: string }[];
  variants?: unknown[];
  colors?: unknown[];
  sizes?: unknown[];
};

const imageOf = (p: Suggestion) =>
  p.img || p.image || p.imageURLs?.[0]?.img || '';

/** Group size -> the slot that comes free. Matches BogoProgress. */
const ORDINALS: Record<number, string> = {
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
};

/**
 * "Add 2 more → 3rd piece is FREE", with something to actually add.
 *
 * Shown only while the offer is running and the basket is short of a
 * complete group: once the free item is earned, this is just clutter in
 * front of the checkout button.
 *
 * Products with options are not added from here — a size and colour have to
 * be chosen — so those link to the product page instead of pretending to
 * add to the basket.
 */
export function BogoCrossSell({
  state,
  inCartIds,
  onNavigate,
}: {
  state: BogoState;
  inCartIds: string[];
  onNavigate?: () => void;
}) {
  const dispatch = useDispatch();
  // Chosen in Dashboard -> Offers. Falls back to the catalogue when nothing
  // has been picked, which is what this strip always used to show.
  const { data, isLoading } = useGetOfferCrossSellQuery(undefined, {
    skip: !state.offer || (state.toQualify === 0 && !state.nextIsFree),
  });

  const suggestions = useMemo(() => {
    const all = (data?.data?.products ?? []) as Suggestion[];
    const seen = new Set(inCartIds.map(String));
    return all.filter(p => !seen.has(String(p._id))).slice(0, 12);
  }, [data, inCartIds]);

  if (!state.offer || (state.toQualify === 0 && !state.nextIsFree)) return null;
  if (!isLoading && suggestions.length === 0) return null;

  const needsOptions = (p: Suggestion) =>
    Boolean(p.variants?.length || p.colors?.length || p.sizes?.length);

  const addToCart = (p: Suggestion) => {
    dispatch(initialOrderQuantity());
    dispatch(
      add_cart_product({
        ...p,
        finalPriceDiscount: p.finalPriceDiscount ?? p.price,
      } as never)
    );
  };

  const groupSize =
    (state.offer.buyQuantity ?? 0) + (state.offer.freeQuantity ?? 0);
  const ordinal = ORDINALS[groupSize] ?? `${groupSize}th`;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">
          {state.nextIsFree
            ? 'Your next one is FREE'
            : `Add ${state.toQualify === 1 ? 'one' : state.toQualify} more and ${ordinal} one is FREE`}
        </p>
        {/* The strip shows a handful; this is the way out to the rest. */}
        <a
          href="/shop"
          onClick={onNavigate}
          className="shrink-0 text-xs font-semibold underline underline-offset-2"
        >
          View all products
        </a>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 w-28 shrink-0 animate-pulse rounded-lg bg-muted" />
          ))}

        {suggestions.map(p => {
          const price = Number(p.finalPriceDiscount ?? p.price ?? 0);
          const src = imageOf(p);
          return (
            <div key={p._id} className="w-28 shrink-0">
              <a
                href={`/product/${p._id}`}
                onClick={onNavigate}
                className="block aspect-[3/4] overflow-hidden rounded-lg bg-white"
              >
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryVariant(src, 200)}
                    alt={p.title ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                )}
              </a>
              <p className="mt-1 truncate text-xs font-medium" title={p.title}>
                {p.title}
              </p>
              <p className="text-xs font-bold text-[var(--wf-now)]">
                {CURRENCY_SYMBOL}
                {money(price)}
              </p>
              {needsOptions(p) ? (
                <a
                  href={`/product/${p._id}`}
                  onClick={onNavigate}
                  className="mt-1 block rounded-md bg-[var(--wf-brand)] py-1.5 text-center text-xs font-semibold text-white"
                >
                  Choose
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(p)}
                  className="mt-1 w-full rounded-md bg-[var(--wf-brand)] py-1.5 text-xs font-semibold text-white"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BogoCrossSell;
