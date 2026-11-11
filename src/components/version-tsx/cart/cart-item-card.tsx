'use client';

import { useState } from 'react';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { isCloudinaryUrl } from '@/lib/product-image';
import type { CartItemType } from './cart-types';

export interface CartItemCardProps {
  /**
   * How many units of this line the running offer is giving away. The whole
   * line is free only when it equals the line's quantity; one free out of
   * three has to say so rather than striking the lot.
   */
  freeUnits?: number;
  item: CartItemType;
  lineTotal: string;
  onIncrement: (item: CartItemType) => void;
  onDecrement: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
  productHref: (item: CartItemType) => string;
  onProductClick?: () => void;
  /** Compact layout for checkout (smaller image, tighter spacing) */
  variant?: 'default' | 'compact';
  /** When true, disable quantity/remove (e.g. during payment) */
  disabled?: boolean;
}

export function CartItemCard({
  item,
  lineTotal,
  freeUnits = 0,
  onIncrement,
  onDecrement,
  onRemove,
  productHref,
  onProductClick,
  variant = 'default',
  disabled = false,
}: CartItemCardProps) {
  const imageUrl = item.img;
  const isCloudinaryImage = isCloudinaryUrl(imageUrl);
  const href = productHref(item);
  const isCompact = variant === 'compact';

  /*
    MRP for the whole line, and the saving it implies.

    `displayMarkedPrice` is the server-enriched MRP and is only trusted when
    `hasDisplayDiscount` is set and it actually exceeds what is being
    charged — otherwise a struck-through price would be claiming a discount
    that does not exist. Multiplied by quantity so it lines up with the line
    total beside it rather than comparing a unit price against a line price.
  */
  const unitMarked = Number(item.displayMarkedPrice);
  const lineTotalValue = Number(lineTotal);
  const markedValue =
    item.hasDisplayDiscount && Number.isFinite(unitMarked)
      ? unitMarked * (Number(item.orderQuantity) || 1)
      : 0;
  const hasMarkdown =
    markedValue > 0 && Number.isFinite(lineTotalValue) && markedValue > lineTotalValue;
  const markedLineTotal = hasMarkdown ? markedValue.toFixed(2) : null;

  /** Long product titles are clamped to one line until tapped. */
  const [titleExpanded, setTitleExpanded] = useState(false);

  /** Chosen configuration options, in order, ready to join onto one line. */
  const selectedOptionNames = Object.values(item.selectedConfigurations ?? {})
    .map(config => config?.option?.name)
    .filter(Boolean);

  /*
    The compact variant carries no card of its own.

    At checkout these lines already sit inside the "Your Order" card, so the
    border + background here produced a box inside a box — on a phone the
    product ended up two frames deep and visibly narrower than the heading
    above it. The standalone cart still needs the card, so only `compact`
    drops it; lines there are separated by a rule instead.
  */
  return (
    <div
      className={
        isCompact
          ? 'group flex gap-2.5 border-b border-border/40 py-2 last:border-b-0 last:pb-0'
          : 'group flex gap-4 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-shadow hover:shadow-md'
      }
    >
      <Link
        href={href}
        className={`relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40 ${
          isCompact ? 'size-12 sm:size-16' : 'size-20'
        }`}
        aria-label={item.title}
        onClick={onProductClick}
      >
        {imageUrl ? (
          <CldImage
            src={imageUrl}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover transition-transform group-hover:scale-105"
            preserveTransformations={isCloudinaryImage}
            deliveryType={isCloudinaryImage ? undefined : 'fetch'}
            loading="lazy"
            fetchPriority="low"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        {/*
          Titles here are long descriptive strings and wrapped to three lines,
          which pushed the quantity and price controls down the card. Clamped
          to one line with an ellipsis; tapping it expands to the full name in
          place rather than navigating away, so the name stays reachable
          without costing vertical space by default.
        */}
        <button
          type="button"
          onClick={() => setTitleExpanded(v => !v)}
          aria-expanded={titleExpanded}
          title={item.title}
          className={`block w-full cursor-pointer text-left font-semibold text-foreground transition-colors hover:text-primary ${
            titleExpanded ? '' : 'truncate'
          }`}
        >
          {item.title}
        </button>
        {item.selectedOption && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.selectedOption.title} (+{CURRENCY_SYMBOL}
            {Number(item.selectedOption.price).toFixed(2)})
          </p>
        )}
        {/* Every chosen option on one line — "Maroon · M" rather than a
            stacked paragraph each, which cost a row per configuration on a
            phone for two short words. */}
        {selectedOptionNames.length > 0 && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {selectedOptionNames.join(' · ')}
          </p>
        )}
        {item.customNotes &&
          Object.keys(item.customNotes).length > 0 && (
            <div className="mt-1 space-y-0.5">
              {Object.entries(item.customNotes).map(
                ([, note]) =>
                  note && (
                    <p key={note} className="text-muted-foreground text-xs italic">
                      Note: {note}
                    </p>
                  )
              )}
            </div>
          )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 md:mt-2.5">
          <div className="flex items-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onDecrement(item)}
              disabled={item.orderQuantity <= 1}
              className="rounded-none hover:bg-muted/60"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </Button>
            <span className="min-w-7 px-1.5 text-center text-sm font-medium tabular-nums">
              {item.orderQuantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onIncrement(item)}
              className="rounded-none hover:bg-muted/60"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(item)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2Icon className="size-3" />
          </Button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {/* The offer names the item it is giving away, here, on the line —
            a saving stated only as a total leaves the shopper working out
            which of their items was the free one. */}
        {freeUnits > 0 && (
          <span className="mb-1 inline-block rounded-full bg-[var(--wf-sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {freeUnits > 1 ? `${freeUnits} free` : 'Free'}
          </span>
        )}
        <span
          className={`block font-bold tabular-nums ${isCompact ? 'text-sm' : 'text-base'} ${
            freeUnits > 0 ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
        >
          {CURRENCY_SYMBOL}{lineTotal}
        </span>
        {/* The MRP struck through. The percentage is deliberately not
            repeated here — the Order Summary already states the saving for
            the whole order, and showing it twice on one screen read as two
            separate discounts. */}
        {markedLineTotal && (
          <span className="text-muted-foreground block text-xs tabular-nums line-through">
            {CURRENCY_SYMBOL}{markedLineTotal}
          </span>
        )}
      </div>
    </div>
  );
}
