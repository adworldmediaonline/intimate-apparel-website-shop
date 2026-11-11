import brandConfig from '../../brand.config.json';

/**
 * The one place category order is decided.
 *
 * Categories come back from the API in insertion order, which is arbitrary and
 * differed between the menus, the shop filters and the home grid — the same
 * seven categories appeared in three different orders. `commerce.categoryOrder`
 * in brand.config.json fixes that order once; everything that lists categories
 * sorts through here.
 *
 * A category missing from the config is not dropped — it sorts after the listed
 * ones, alphabetically, so adding a category in the admin panel makes it appear
 * rather than vanish.
 */
const CONFIGURED: string[] =
  (brandConfig.commerce as { categoryOrder?: string[] }).categoryOrder ?? [];

const normalise = (name: unknown) =>
  String(name ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const RANK = new Map(CONFIGURED.map((name, i) => [normalise(name), i]));

/** Position of a category name, or Infinity when it is not in the config. */
export function categoryRank(name: unknown): number {
  return RANK.get(normalise(name)) ?? Number.POSITIVE_INFINITY;
}

/**
 * Sort any list of category-ish objects into the configured order.
 * `getName` pulls the display name out of whatever shape the caller holds.
 */
export function sortByCategoryOrder<T>(
  items: readonly T[],
  getName: (item: T) => unknown
): T[] {
  /**
   * The admin's drag order wins when it exists.
   *
   * `sortKey` is a fractional index written by the ordering sheet in the
   * admin panel, so it reflects a decision somebody made this morning; the
   * `categoryOrder` list in brand.config.json is the old mechanism and needed
   * a deploy to change. It stays as the fallback for anything the admin has
   * not touched — and for a list that is not categories at all.
   */
  const keyed = items.every(item => {
    const value = (item as { sortKey?: unknown })?.sortKey;
    return typeof value === 'string' && value.length > 0;
  });

  if (keyed && items.length > 0) {
    return [...items].sort((a, b) =>
      String((a as { sortKey?: string }).sortKey).localeCompare(
        String((b as { sortKey?: string }).sortKey)
      )
    );
  }

  return [...items].sort((a, b) => {
    const rankA = categoryRank(getName(a));
    const rankB = categoryRank(getName(b));
    if (rankA !== rankB) return rankA - rankB;
    // Unconfigured categories fall back to alphabetical so the order is at
    // least stable and predictable rather than insertion order.
    return String(getName(a) ?? '').localeCompare(String(getName(b) ?? ''));
  });
}

export default sortByCategoryOrder;
