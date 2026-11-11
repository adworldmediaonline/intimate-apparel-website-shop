/**
 * Variant (productConfiguration) selection and pricing for the PDP.
 *
 * The maths here deliberately mirrors `product-configuration-dialog.tsx`
 * (`calculateFinalPrice` / `calculateMarkedUpPrice`) so a pack chosen in the
 * buy box, in the sticky bar and in the dialog all resolve to the same rupee:
 * a fixed option price is treated as that variant's MRP and scaled by the
 * parent's discount ratio, while percentage options multiply the base.
 */
import { getConfigurationOverridePrice } from '@/lib/configuration-price';

export type VariantOption = {
  name: string;
  price?: number | string;
  /** MRP for this option, struck through beside `price`. See resolveVariantPricing. */
  markedPrice?: number | string;
  priceType?: 'fixed' | 'percentage';
  percentage?: number;
  isPercentageIncrease?: boolean;
  isSelected?: boolean;
  /** Paused in the admin: still listed, but greyed out and not buyable. */
  isPaused?: boolean;
  image?: string;
  /**
   * Photographs for this option, shown in the gallery when it is selected.
   * `imageURLsWithMeta` is what the admin panel writes; `images` is the plain
   * form used by the catalogue importer. Read both through `optionImages`.
   */
  imageURLsWithMeta?: { url?: string }[];
  images?: string[];
  quantity?: number | null;
};

export type VariantConfiguration = {
  title: string;
  options: VariantOption[];
  enableCustomNote?: boolean;
};

/** Keyed by configuration index, matching what the cart and `getCartItemId` expect. */
export type VariantSelection = Record<
  number,
  { optionIndex: number; option: VariantOption }
>;

const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function getVariantConfigurations(
  product: Record<string, any>
): VariantConfiguration[] {
  const configs = product?.productConfigurations;
  if (!Array.isArray(configs)) return [];
  return configs.filter(
    (c): c is VariantConfiguration =>
      Boolean(c) && Array.isArray(c.options) && c.options.length > 0
  );
}

export function hasVariants(product: Record<string, any>) {
  return getVariantConfigurations(product).length > 0;
}

/** Honours each configuration's `isSelected` flag, falling back to the first option. */
export function defaultVariantSelection(
  product: Record<string, any>
): VariantSelection {
  const selection: VariantSelection = {};
  getVariantConfigurations(product).forEach((config, configIndex) => {
    // Never open on an option nobody can buy: a paused or sold-out default
    // would show a price and an Add to Cart the shopper cannot use.
    const isBuyable = (o: VariantOption) => !o.isPaused && o.quantity !== 0;
    const preselected = config.options.findIndex(o => o.isSelected && isBuyable(o));
    const firstBuyable = config.options.findIndex(isBuyable);
    const optionIndex =
      preselected !== -1 ? preselected : firstBuyable !== -1 ? firstBuyable : 0;
    selection[configIndex] = { optionIndex, option: config.options[optionIndex] };
  });
  return selection;
}

const applyPercentages = (
  base: number,
  adjustments: { percentage: number; isIncrease: boolean }[]
) =>
  adjustments.reduce(
    (price, a) =>
      a.isIncrease ? price * (1 + a.percentage / 100) : price * (1 - a.percentage / 100),
    base
  );

/**
 * Selling price and struck-through price for the current selection.
 * With no configurations (or no selection) this is just the product's own pricing.
 */
/** Photographs attached to one option, from either shape the data can take. */
export function optionImages(option?: VariantOption | null): string[] {
  if (!option) return [];
  const withMeta = (option.imageURLsWithMeta ?? [])
    .map(entry => entry?.url)
    .filter((url): url is string => Boolean(url));
  return withMeta.length ? withMeta : (option.images ?? []).filter(Boolean);
}

/**
 * Photographs the PDP opens on: those of the default selection, flattened in
 * configuration order, exactly as the buy box's effect computes them.
 *
 * Sharing this with the server render and with the product grid is the point —
 * when each worked it out separately, the card showed one photograph, the page
 * server-rendered a second, and hydration swapped in a third.
 */
export function defaultVariantImages(product: Record<string, any>): string[] {
  return defaultVariantImages_(defaultVariantSelection(product));
}

/** Photographs for a live selection, flattened in configuration order. */
export function selectedVariantImages(selection: VariantSelection): string[] {
  return defaultVariantImages_(selection);
}

function defaultVariantImages_(selection: VariantSelection): string[] {
  return Object.values(selection).flatMap(entry => optionImages(entry?.option));
}

export function resolveVariantPricing(
  product: Record<string, any>,
  selection: VariantSelection
): { price: number; markedPrice?: number } {
  const productFinal = num(product.finalPriceDiscount);
  const productMarked = num(product.displayMarkedPrice ?? product.finalPriceDiscount);
  const hasDiscount = Boolean(product.hasDisplayDiscount);

  const entries = Object.values(selection);
  if (entries.length === 0) {
    return {
      price: round2(productFinal),
      markedPrice: hasDiscount && productMarked > productFinal ? round2(productMarked) : undefined,
    };
  }

  const override = getConfigurationOverridePrice(product as any, selection as any);
  let fixedPrice = 0;
  const percentageAdjustments: { percentage: number; isIncrease: boolean }[] = [];

  if (override != null) {
    fixedPrice = override;
  } else {
    for (const { option } of entries) {
      if (!option) continue;
      if (option.priceType === 'percentage') {
        percentageAdjustments.push({
          percentage: option.percentage || 0,
          isIncrease: option.isPercentageIncrease !== false,
        });
      } else if (num(option.price) > 0) {
        fixedPrice += num(option.price);
      }
    }
  }

  // An option may carry its own MRP. That pair is authoritative: pack sizes are
  // discounted at different rates (a 20-pack is not marked down like an 80-pack),
  // which a single parent ratio cannot reproduce. Options without a markedPrice
  // keep the legacy behaviour below.
  if (override == null) {
    let optionMarked = 0;
    let hasOptionMarked = false;
    for (const { option } of entries) {
      if (!option || option.priceType === 'percentage') continue;
      const ownMarked = num(option.markedPrice);
      if (ownMarked > 0) {
        hasOptionMarked = true;
        optionMarked += ownMarked;
      } else {
        optionMarked += num(option.price);
      }
    }
    if (hasOptionMarked && fixedPrice > 0) {
      const price = round2(applyPercentages(fixedPrice, percentageAdjustments));
      const marked = round2(applyPercentages(optionMarked, percentageAdjustments));
      return { price, markedPrice: marked > price ? marked : undefined };
    }
  }

  let base = productFinal;
  if (fixedPrice > 0) {
    base = fixedPrice;
    // A fixed option price is an MRP; scale it by the parent's discount ratio.
    if (hasDiscount && productMarked > 0) {
      base = fixedPrice * (productFinal / productMarked);
    }
  }

  const price = round2(applyPercentages(base, percentageAdjustments));
  const marked = round2(
    applyPercentages(fixedPrice > 0 ? fixedPrice : productMarked, percentageAdjustments)
  );

  return { price, markedPrice: marked > price ? marked : undefined };
}

/**
 * Cart payload for a variant selection, in the shape `getCartItemId` keys on —
 * without `selectedConfigurations` every pack would collapse into one cart line.
 */
export function buildVariantCartProduct(
  product: Record<string, any>,
  selection: VariantSelection,
  price: number,
  markedPrice?: number
): Record<string, any> {
  const configs = getVariantConfigurations(product);
  const entries = Object.keys(selection);

  // The cart, the checkout summary and the order emails all render `img`.
  // Spreading the product alone left that as the product's default photograph,
  // so a shopper who picked Black saw the red default beside "Black" in their
  // cart. Point it at the selected variant's own picture where it has one.
  const [selectedImage] = selectedVariantImages(selection);

  return {
    ...product,
    ...(selectedImage ? { img: selectedImage } : {}),
    finalPriceDiscount: price,
    updatedPrice: markedPrice ?? price,
    basePrice: markedPrice ?? price,
    ...(entries.length
      ? {
          selectedConfigurations: selection,
          productConfigurations: configs.map((config, configIndex) => {
            const selected = selection[configIndex];
            if (!selected) return config;
            return {
              ...config,
              options: config.options.map((option, optionIndex) => ({
                ...option,
                isSelected: optionIndex === selected.optionIndex,
              })),
            };
          }),
        }
      : {}),
  };
}

/** Short label for the sticky bar, e.g. "Pack of 80". */
export function variantSummary(selection: VariantSelection) {
  return Object.values(selection)
    .map(entry => entry?.option?.name)
    .filter(Boolean)
    .join(' · ');
}
