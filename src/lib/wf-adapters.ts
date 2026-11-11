/**
 * Adapters from the backend's product/category shapes to the editorial layout's
 * view models. Kept deliberately defensive: the storefront must render even when
 * the API is unreachable or a field is missing, so every accessor is optional
 * and every list falls back to an empty array.
 */
import type { WfProduct } from '@/components/wireframe/wf-product-card';
import type { CollectionTile } from '@/components/wireframe/wf-collections-grid';
import { defaultVariantImages } from '@/lib/product-variants';
import { sortByCategoryOrder } from '@/lib/category-order';

type Raw = Record<string, any>;

/**
 * The photograph the product page opens on.
 *
 * The PDP hands its gallery the images of whichever variant is selected by
 * default (`defaultVariantSelection` -> `optionImages`), so a product whose
 * colours carry their own photography opens on the first colour's picture, not
 * on `product.img`. The grid has to agree, otherwise the card shows one garment
 * and tapping it shows another.
 */
function defaultVariantImage(p: Raw): string | undefined {
  // The slim list shape has already resolved this server-side; the full shape
  // carries the configurations and we work it out here.
  if (typeof p?.variantImage === 'string' && p.variantImage) return p.variantImage;
  try {
    return defaultVariantImages(p)[0];
  } catch {
    // A malformed configuration must not cost us the card's picture.
    return undefined;
  }
}

function firstImage(p: Raw): string | undefined {
  return (
    // Set by the API only when a colour filter is active: showing the default
    // red shot in a list the shopper filtered to Black reads as a wrong result.
    (typeof p?.colourImage === 'string' ? p.colourImage : undefined) ||
    defaultVariantImage(p) ||
    p?.img ||
    p?.image ||
    (Array.isArray(p?.imageURLs) ? p.imageURLs[0]?.img || p.imageURLs[0] : undefined) ||
    (Array.isArray(p?.images) ? p.images[0]?.url || p.images[0] : undefined) ||
    undefined
  );
}

export function toWfProduct(p: Raw): WfProduct | null {
  if (!p) return null;
  const id = String(p._id ?? p.id ?? p.slug ?? '');
  const title = p.title ?? p.name ?? p.productName;
  if (!id || !title) return null;

  const price = Number(p.finalPriceDiscount ?? p.price ?? 0);
  const marked = Number(p.displayMarkedPrice ?? p.updatedPrice ?? p.price ?? 0);

  // Cards all read "Add to Cart"; this flag decides whether the click opens the
  // product page so a variant can be picked, or adds straight to the cart.
  // Slim responses carry this precomputed; full ones are inspected directly.
  const hasOptions =
    typeof p.hasOptions === 'boolean'
      ? p.hasOptions
      : (Array.isArray(p.options) && p.options.length > 0) ||
        (Array.isArray(p.productConfigurations) && p.productConfigurations.length > 0);

  const outOfStock =
    p.status === 'out-of-stock' || (typeof p.quantity === 'number' && p.quantity <= 0);

  return {
    id,
    title,
    href: `/product/${p.slug ?? id}`,
    category: p?.category?.name ?? p?.parent ?? undefined,
    image: firstImage(p),
    price,
    markedPrice: marked > price ? marked : undefined,
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    reviewCount: Array.isArray(p.reviews) ? p.reviews.length : p.reviewCount,
    hasOptions,
    outOfStock,
    raw: p,
    // An admin-set badge wins over the two derived ones: if someone has
    // gone to the trouble of marking a product "Last few left", that is
    // more useful on the card than "Sale", which the struck price already
    // says. Only the first is shown — a stack of badges covers the photo.
    badge: Array.isArray(p.badges) && p.badges.length > 0
      ? { label: String(p.badges[0]), tone: 'new' as const }
      : p.isFeatured
        ? { label: 'Bestseller', tone: 'best' as const }
        : marked > price
          ? { label: 'Sale', tone: 'sale' as const }
          : undefined,
  };
}

export function toWfProducts(list: unknown, limit = 8): WfProduct[] {
  if (!Array.isArray(list)) return [];
  const out: WfProduct[] = [];
  for (const raw of list) {
    if (out.length >= limit) break;
    const p = toWfProduct(raw as Raw);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Category tiles, for the home grid and the all-categories page.
 *
 * Every visible category is a tile, in the store-wide order. The caller's
 * `limit` decides how many of them are drawn — the home page takes the first
 * few, the categories page passes them all.
 */
export function toCollectionTiles(
  list: unknown,
  limit = 5,
  { homeOnly = false }: { homeOnly?: boolean } = {}
): CollectionTile[] {
  if (!Array.isArray(list)) return [];

  // `showOnHome` is the admin's switch for the home grid specifically. The
  // all-categories page passes homeOnly: false and shows everything visible.
  const source = homeOnly
    ? (list as Raw[]).filter(c => (c as { showOnHome?: boolean })?.showOnHome !== false)
    : (list as Raw[]);

  /**
   * Which categories appear, and in what order, is decided in the admin.
   *
   * This used to filter against `commerce.homeCollections` in
   * brand.config.json and sort by `commerce.categoryOrder`, so changing the
   * shop front meant a code change and a deploy. Both now come from the
   * category documents themselves — `showOnHome` and the `sortKey` the
   * ordering sheet writes.
   */
  const named = (c: Raw) => String(c?.parent ?? c?.name ?? c?.title ?? '');
  const ordered = sortByCategoryOrder(source, named);

  const out: CollectionTile[] = [];
  for (const raw of ordered) {
    if (out.length >= limit) break;
    const c = raw as Raw;
    const title = c?.parent ?? c?.name ?? c?.title;
    if (!title) continue;
    const slug = String(title).toLowerCase().replace(/\s+/g, '-');
    out.push({
      title: String(title),
      caption: c?.productType ? String(c.productType) : undefined,
      href: `/shop?category=${encodeURIComponent(slug)}`,
      image: c?.img ?? c?.image ?? undefined,
    });
  }
  return out;
}

/** Never let a data-layer failure take the page down. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
