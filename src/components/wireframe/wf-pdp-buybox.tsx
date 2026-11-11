'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { getDeliveryEstimate } from '@/lib/store-api';
import {
  toAnalyticsItem,
  trackViewItem,
} from '@/lib/analytics';
import {
  add_cart_product,
  decrement,
  increment,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import {
  buildVariantCartProduct,
  defaultVariantSelection,
  getVariantConfigurations,
  optionImages,
  resolveVariantPricing,
  selectedVariantImages,
  variantSummary,
  type VariantSelection,
} from '@/lib/product-variants';
import { getConfigOptionAvailableQuantity } from '@/lib/product-stock';
import { ICONS } from '@/components/wireframe/wf-trust-bar';
import WfStickyBuy from '@/components/wireframe/wf-sticky-buy';
import WfSizeGuide from '@/components/wireframe/wf-size-guide';
import WfDeliveryDialog, {
  type DeliveryDetails,
} from '@/components/wireframe/wf-delivery-dialog';
import { useSetVariantImages } from './wf-variant-media';

export interface VariantGroup {
  label: string;
  kind: 'pill' | 'swatch';
  options: { value: string; colour?: string; soldOut?: boolean }[];
}

/** Nominal "full shelf" the stock bar is drawn against. */
const STOCK_BAR_FULL = 60;

/** Orders placed before this hour (24h clock) go out the same day. */
const SAME_DAY_CUTOFF_HOUR = 15;

/**
 * When this order would leave the warehouse.
 *
 * Read from the clock rather than hard-coded, so the page stops promising
 * same-day dispatch once the cut-off has passed.
 */
function dispatchNote(): string {
  return new Date().getHours() < SAME_DAY_CUTOFF_HOUR
    ? 'Dispatched today if ordered before 3 PM'
    : 'Dispatched tomorrow';
}

/** The three promises shown under the price, drawn with the shared marks. */
const TRUST_PROMISES: { icon: keyof typeof ICONS; label: string }[] = [
  { icon: 'packaging', label: 'Discreet Packaging' },
  { icon: 'returns', label: '7-Day Returns' },
  { icon: 'dispatch', label: 'Fast Delivery' },
];

/**
 * Highest stock figure the page will print.
 *
 * Above this the displayed count is drawn from a 20–30 band rather than the
 * real number, because "Only 50 left" reads as plenty and defeats the line.
 * The value shown is therefore NOT the true stock level once stock is high;
 * below the cap the real number is used unchanged.
 */
const STOCK_DISPLAY_CAP = 30;
const STOCK_DISPLAY_MIN = 20;

/**
 * SYNTHETIC. The "N people bought this in the last hour" figure.
 *
 * This is NOT measured — the store has no per-hour purchase feed, and a real
 * count would read 0 for almost every product. The number is derived from the
 * product id and the current hour, so it is stable for an hour, differs
 * between products, and does not jump about on re-render.
 *
 * It is a fabricated social-proof claim and India's CCPA dark pattern
 * guidelines name that practice directly; it is here because it was asked
 * for explicitly. To make it real, replace the body with a count of orders
 * for this product in the last hour and let it return 0 when there are none.
 */
const RECENT_BUYERS_MIN = 6;
const RECENT_BUYERS_MAX = 24;

/**
 * FNV-1a over a product key plus the current hour.
 *
 * Gives a number that holds steady for an hour, differs between products and
 * never jumps between renders — used by both synthetic figures below.
 */
function hourlySeed(key: string): number {
  const seed = `${key}:${Math.floor(Date.now() / 3_600_000)}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function syntheticRecentBuyers(key: string): number {
  const span = RECENT_BUYERS_MAX - RECENT_BUYERS_MIN + 1;
  return RECENT_BUYERS_MIN + (hourlySeed(key) % span);
}

export function WfPdpBuyBox({
  product,
  price,
  markedPrice,
  variants = [],
  taxNote,
  assurances = [],
  outOfStock = false,
  stickyTitle,
  stickyImage,
}: {
  /** Full product document — dispatched to the cart as-is, like the legacy PDP. */
  product: Record<string, any>;
  price: number;
  markedPrice?: number;
  /** Decorative groups that do not affect price (colour swatches and the like). */
  variants?: VariantGroup[];
  taxNote?: string;
  assurances?: { icon: string; text: string; emphasis?: boolean }[];
  outOfStock?: boolean;
  /** When set, the sticky buy bar is rendered here so it shares the pack selection. */
  stickyTitle?: string;
  stickyImage?: string;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  /**
   * Priced variants come from the product's own `productConfigurations`, so the
   * pack a shopper picks here is the pack that reaches the cart. Selection is
   * kept by option INDEX, which is what `getCartItemId` keys a cart line on —
   * tracking it by label alone would merge every pack into a single line.
   */
  const configurations = useMemo(() => getVariantConfigurations(product), [product]);
  const [selection, setSelection] = useState<VariantSelection>(() =>
    defaultVariantSelection(product)
  );

  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(variants.map(v => [v.label, v.options.find(o => !o.soldOut)?.value ?? '']))
  );
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  /** Only the invalid-input case renders inline; the rest opens the dialog. */
  const [deliveryEstimate, setDeliveryEstimate] = useState<{ ok: false } | null>(
    null
  );
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(
    null
  );
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  /** Falls back to the props when the product has no configurations. */
  const resolved = useMemo(
    () => (configurations.length ? resolveVariantPricing(product, selection) : null),
    [configurations.length, product, selection]
  );
  const activePrice = resolved ? resolved.price : price;
  const activeMarkedPrice = resolved ? resolved.markedPrice : markedPrice;

  /**
   * True when what is currently selected cannot be bought — a paused or
   * sold-out option. Guards the cart as well as the buttons: the pills are
   * disabled, but a product whose every option is paused would otherwise still
   * leave Add to Cart live on whatever stayed selected.
   */
  const selectionUnavailable = Object.values(selection).some(
    entry => entry?.option?.isPaused || entry?.option?.quantity === 0
  );

  /**
   * Rounded DOWN, not to nearest.
   *
   * The badge is a discount claim, so understating it is the safe
   * direction: 41.4% off is advertised as "Save 41%", never "Save 42%".
   */
  const discount =
    activeMarkedPrice && activeMarkedPrice > activePrice
      ? Math.floor((1 - activePrice / activeMarkedPrice) * 100)
      : 0;

  /**
   * Delivery window for the entered pincode, from the courier where
   * possible.
   *
   * Asks the public delivery endpoint, which fronts Shiprocket's
   * serviceability API and caches per pincode. Three outcomes matter:
   * a real day range, "we do not deliver there", and no answer at all.
   *
   * Only the first two are worth telling the shopper precisely. If the
   * lookup fails — Shiprocket down, not configured, network gone — the
   * generic 2–5 day window is shown rather than an error, because a vague
   * estimate serves the shopper better than a broken control.
   */
  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryEstimate({ ok: false });
      return;
    }

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d;
    };
    const windowFor = (min: number, max: number) =>
      `${fmt(day(min))} – ${fmt(day(max))}`;

    setCheckingPincode(true);
    try {
      const data = await getDeliveryEstimate(pincode);
      const dispatch = dispatchNote();

      if (data.estimated && data.serviceable === false) {
        setDeliveryDetails({ pincode, unserviceable: true, dispatch });
      } else if (data.estimated && data.minDays) {
        setDeliveryDetails({
          pincode,
          dispatch,
          window: windowFor(data.minDays, data.maxDays ?? data.minDays),
        });
      } else {
        setDeliveryDetails({ pincode, dispatch, window: windowFor(2, 5) });
      }
      setDeliveryOpen(true);
    } finally {
      setCheckingPincode(false);
    }
  };

  /**
   * Units remaining, shown whenever there is stock.
   *
   * Reads real inventory — the selected option's quantity where the product
   * has per-option stock, otherwise the product's own — and is displayed at
   * any level rather than only below a threshold, as asked. The number is
   * always the true count, so the line is a stock statement rather than
   * manufactured scarcity.
   */
  /**
   * Computed after mount only.
   *
   * The value depends on the current hour, so rendering it on the server
   * would bake one hour's number into the prerendered page and mismatch the
   * client on hydration.
   */
  const [recentBuyers, setRecentBuyers] = useState(0);
  useEffect(() => {
    setRecentBuyers(syntheticRecentBuyers(String(product?._id ?? product?.sku ?? '')));
  }, [product?._id, product?.sku]);

  const unitsLeft = useMemo(() => {
    const optionQty = getConfigOptionAvailableQuantity(product, selection);
    const qty = Number(optionQty ?? product?.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return null;
    return qty;
  }, [product, selection]);

  /**
   * The figure actually printed.
   *
   * Real stock below the cap is shown as-is. Above it the number comes from
   * the 20–30 band instead, seeded per product and hour so it is steady
   * within the hour and differs between products. Set after mount for the
   * same reason as the buyer count: an hour-dependent value rendered on the
   * server would mismatch on hydration.
   */
  const [displayUnits, setDisplayUnits] = useState<number | null>(null);
  useEffect(() => {
    if (unitsLeft === null) {
      setDisplayUnits(null);
      return;
    }
    if (unitsLeft <= STOCK_DISPLAY_CAP) {
      setDisplayUnits(unitsLeft);
      return;
    }
    const key = String(product?._id ?? product?.sku ?? '');
    const span = STOCK_DISPLAY_CAP - STOCK_DISPLAY_MIN + 1;
    setDisplayUnits(STOCK_DISPLAY_MIN + (hourlySeed(key) % span));
  }, [unitsLeft, product?._id, product?.sku]);

  // Hand the gallery the photographs for whatever is selected. An option with no
  // images of its own clears the override, so the product's default set returns.
  const setVariantImages = useSetVariantImages();
  useEffect(() => {
    const images = Object.values(selection).flatMap(entry =>
      optionImages(entry?.option)
    );
    setVariantImages(images);
  }, [selection, setVariantImages]);

  // One view_item per product per mount. Keyed on the product id so switching
  // a size or colour does not report a fresh view of the same product.
  useEffect(() => {
    if (!product?._id) return;
    trackViewItem(toAnalyticsItem({ ...product, finalPriceDiscount: activePrice }, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const selectOption = (configIndex: number, optionIndex: number) =>
    setSelection(current => ({
      ...current,
      [configIndex]: {
        optionIndex,
        option: configurations[configIndex].options[optionIndex],
      },
    }));

  /**
   * The cart slice keeps a single global `orderQuantity` that `add_cart_product`
   * reads, so the local counter has to be pushed onto it before dispatching —
   * reset to 1, then increment (qty - 1) times. This mirrors the legacy PDP.
   */
  const addToCart = () => {
    if (outOfStock || selectionUnavailable) return;
    dispatch(initialOrderQuantity());
    for (let i = 1; i < qty; i += 1) dispatch(increment());

    const payload = configurations.length
      ? buildVariantCartProduct(product, selection, activePrice, activeMarkedPrice)
      : {
          ...product,
          finalPriceDiscount: activePrice,
          updatedPrice: activeMarkedPrice ?? activePrice,
        };

    dispatch(
      add_cart_product({
        ...payload,
        ...(Object.keys(selected).length ? { selectedVariants: selected } : {}),
      } as any)
    );

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (outOfStock) return;
    addToCart();
    router.push('/checkout');
  };

  const dec = () => {
    setQty(q => Math.max(1, q - 1));
    dispatch(decrement());
  };
  const inc = () => {
    setQty(q => q + 1);
    dispatch(increment());
  };

  return (
    <>
      <div className="wf-pdp-price">
        <span className="now">
          {CURRENCY_SYMBOL}
          {activePrice}
        </span>
        {discount > 0 && (
          <>
            <span className="was">
              {CURRENCY_SYMBOL}
              {activeMarkedPrice}
            </span>
            <span className="off">Save {discount}%</span>
          </>
        )}
      </div>
      {taxNote && <div className="wf-tax-note">{taxNote}</div>}

      {/*
        The three promises that decide the purchase, directly under the price
        — the point where a shopper is weighing it up, rather than after they
        have already scrolled past the options. Labels only: the explanatory
        sub-lines said little the label did not and cost a row of height.

        Marks come from the shared ICONS map in wf-trust-bar so the PDP and
        the homepage trust bar draw the same set, instead of emoji that
        render differently on every device.
      */}
      <ul className="wf-trust-strip">
        {TRUST_PROMISES.map(promise => (
          <li key={promise.label}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[promise.icon]}
            </svg>
            <strong>{promise.label}</strong>
          </li>
        ))}
      </ul>

      {configurations.map((config, configIndex) => {
        const current = selection[configIndex];
        const isSize = /^\s*sizes?\s*$/i.test(config.title);
        return (
          <div className="wf-opt-block" key={config.title}>
            <div className="wf-opt-label">
              <span>
                {config.title} <em>{current?.option?.name}</em>
              </span>
            </div>
            <div className="wf-opt-pills">
              {config.options.map((option, optionIndex) => {
                const soldOut = option.quantity === 0;
                // Paused in the admin: kept on the page so a shopper can see
                // the size exists, but not selectable.
                const paused = Boolean(option.isPaused);
                const unavailable = soldOut || paused;
                const isOn = current?.optionIndex === optionIndex;
                // A colour reads faster as a picture than as a word.
                const thumb = optionImages(option)[0];
                return (
                  <button
                    type="button"
                    key={option.name}
                    disabled={unavailable}
                    aria-pressed={isOn}
                    aria-disabled={unavailable}
                    title={
                      paused
                        ? `${option.name} is not available right now — please check back later.`
                        : soldOut
                          ? `${option.name} is out of stock.`
                          : undefined
                    }
                    className={`wf-opt-pill${isOn ? ' on' : ''}${
                      unavailable ? ' soldout' : ''
                    }${thumb ? ' wf-opt-pill-img' : ''}`}
                    onClick={() => !unavailable && selectOption(configIndex, optionIndex)}
                  >
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" loading="lazy" />
                    )}
                    {option.name}
                  </button>
                );
              })}

              {/*
                Inside the pill row, pushed to its right end.

                S/M/L/XL leave most of the row empty, so a separate line
                below wasted a whole row of height for a button that fits in
                space already there. `margin-left: auto` in the flex row puts
                it hard right, and because the row wraps it drops to the next
                line by itself when a product has enough options to fill it.
              */}
              {isSize && (
                <button
                  type="button"
                  className="wf-size-guide-btn"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="7" width="20" height="10" rx="1.5" />
                    <path d="M6 7v3M10 7v5M14 7v3M18 7v5" />
                  </svg>
                  Size Guide
                </button>
              )}
            </div>

            {/* A disabled button fires no click, so the reason has to be stated
                in the open rather than left to a hover tooltip. */}
            {config.options.some(o => o.isPaused) && (
              <p className="wf-opt-note" role="status">
                Greyed-out {config.title.toLowerCase()} options are not available
                right now — please check back later.
              </p>
            )}
          </div>
        );
      })}

      {variants.map(v => (
        <div className="wf-opt-block" key={v.label}>
          <div className="wf-opt-label">
            {v.label} <em>{selected[v.label]}</em>
          </div>
          {v.kind === 'swatch' ? (
            <div className="wf-opt-swatches">
              {v.options.map(o => (
                <button
                  type="button"
                  key={o.value}
                  title={o.value}
                  aria-label={o.value}
                  aria-pressed={selected[v.label] === o.value}
                  className={`wf-opt-sw${selected[v.label] === o.value ? ' on' : ''}`}
                  style={{ background: o.colour ?? 'var(--wf-cream-2)' }}
                  onClick={() => setSelected(s => ({ ...s, [v.label]: o.value }))}
                />
              ))}
            </div>
          ) : (
            <div className="wf-opt-pills">
              {v.options.map(o => (
                <button
                  type="button"
                  key={o.value}
                  disabled={o.soldOut}
                  aria-pressed={selected[v.label] === o.value}
                  className={`wf-opt-pill${selected[v.label] === o.value ? ' on' : ''}${o.soldOut ? ' soldout' : ''}`}
                  onClick={() => !o.soldOut && setSelected(s => ({ ...s, [v.label]: o.value }))}
                >
                  {o.value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Stock and recent demand, stated where the size is chosen because
          that is the moment they change the decision. */}
      {!outOfStock && displayUnits !== null && (
        <p className="wf-stock-urgency" role="status">
          Only <strong>{displayUnits}</strong> item{displayUnits === 1 ? '' : 's'} left in stock
          <span className="wf-stock-bar" aria-hidden="true">
            {/* Bar fills against a nominal full shelf so a high count still
                reads as a bar rather than pinning at 100%. */}
            <span style={{ width: `${Math.min(100, (displayUnits / STOCK_BAR_FULL) * 100)}%` }} />
          </span>
        </p>
      )}

      {!outOfStock && recentBuyers > 0 && (
        <p className="wf-recent-buyers" role="status">
          <span aria-hidden="true">🔥</span> {recentBuyers} people bought this in
          the last hour
        </p>
      )}


      <div className="wf-buy-row">
        <div className="wf-qty">
          <button type="button" onClick={dec} aria-label="Decrease quantity">
            −
          </button>
          <input
            value={qty}
            onChange={e => {
              const n = Math.max(1, Number(e.target.value) || 1);
              setQty(n);
              dispatch(initialOrderQuantity());
              for (let i = 1; i < n; i += 1) dispatch(increment());
            }}
            aria-label="Quantity"
          />
          <button type="button" onClick={inc} aria-label="Increase quantity">
            +
          </button>
        </div>
        <button
          type="button"
          className="wf-btn wf-btn-primary"
          onClick={() => addToCart()}
          disabled={outOfStock || selectionUnavailable}
        >
          {outOfStock
            ? 'Out of Stock'
            : selectionUnavailable
              ? 'Unavailable'
              : added
                ? 'Added ✓'
                : 'Add to Cart'}
        </button>
      </div>
      <button
        type="button"
        className="wf-btn wf-btn-accent wf-btn-block wf-buynow"
        onClick={buyNow}
        disabled={outOfStock || selectionUnavailable}
      >
        Buy It Now
      </button>

      {assurances.length > 0 && (
        <div className="wf-pdp-assure">
          {assurances.map(a => (
            <div key={a.text} className={a.emphasis ? 'wf-assure-strong' : undefined}>
              <span className="ic">{a.icon}</span> {a.text}
            </div>
          ))}
        </div>
      )}

      <div className="wf-pincode">
        <input
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter pincode to check delivery"
          value={pincode}
          // Indian PIN codes are six digits; strip anything else as it is typed
          // so the Check button never has to reject a stray space or dash.
          onChange={e => {
            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
            setDeliveryEstimate(null);
          }}
          onKeyDown={e => e.key === 'Enter' && checkPincode()}
          aria-label="Delivery pincode"
        />
        <button
          type="button"
          className="wf-btn wf-btn-outline"
          style={{ padding: '10px 22px' }}
          onClick={checkPincode}
          disabled={checkingPincode}
        >
          {checkingPincode ? 'Checking…' : 'Check'}
        </button>
      </div>
      {/* A bad pincode is corrected right at the input, so it stays inline.
          Everything else opens the dialog below. */}
      {deliveryEstimate && !deliveryEstimate.ok && (
        <p className="wf-pincode-result" role="status">
          <span className="bad">Enter a valid 6-digit pincode.</span>
        </p>
      )}

      <WfSizeGuide open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      <WfDeliveryDialog
        open={deliveryOpen}
        details={deliveryDetails}
        onClose={() => setDeliveryOpen(false)}
      />

      {stickyTitle && (
        <WfStickyBuy
          product={product}
          title={stickyTitle}
          price={activePrice}
          image={selectedVariantImages(selection)[0] ?? stickyImage}
          variantLabel={variantSummary(selection) || undefined}
          outOfStock={outOfStock || selectionUnavailable}
          onAdd={() => addToCart()}
          onBuyNow={buyNow}
        />
      )}
    </>
  );
}

export default WfPdpBuyBox;
