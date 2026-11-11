/**
 * Server-side product price enrichment.
 * Product display prices are managed from stored product fields only.
 */

/** Product shape for enrichment - needs _id, price, updatedPrice, finalPriceDiscount */
type ProductForEnrichment = {
  _id: string;
  price?: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  [key: string]: unknown;
};

/** Enriched product with display price fields */
export type EnrichedProduct = ProductForEnrichment & {
  displayPrice?: number;
  displayMarkedPrice?: number;
  hasDisplayDiscount?: boolean;
};

/** Kept for compatibility with existing callers. */
export type EnrichmentPreFetched = unknown;

function firstMarkedPriceAboveSale(product: ProductForEnrichment, salePrice: number) {
  const candidates = [product.updatedPrice, product.price];
  for (const value of candidates) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > salePrice) {
      return amount;
    }
  }
  return undefined;
}

function firstPositiveMoney(...values: unknown[]) {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }
  return 0;
}

function enrichProductsSync<T extends ProductForEnrichment>(
  products: T[]
): (T & EnrichedProduct)[] {
  return products.map((p) => {
    const displayPrice = firstPositiveMoney(
      p.finalPriceDiscount,
      p.updatedPrice,
      p.price
    );
    const displayMarkedPrice = firstMarkedPriceAboveSale(p, displayPrice);
    const hasDisplayDiscount = typeof displayMarkedPrice === "number";

    return {
      ...p,
      finalPriceDiscount: displayPrice,
      displayPrice,
      displayMarkedPrice,
      hasDisplayDiscount,
    };
  });
}

/**
 * Enrich products with display prices on the server.
 */
export async function enrichProductsWithDisplayPrices<T extends ProductForEnrichment>(
  products: T[],
  preFetched?: EnrichmentPreFetched
): Promise<(T & EnrichedProduct)[]> {
  void preFetched;
  if (products.length === 0) return [];

  try {
    return enrichProductsSync(products);
  } catch (err) {
    console.error("enrichProductsWithDisplayPrices error:", err);
    return products.map((p) => {
      const displayPrice = firstPositiveMoney(
        p.finalPriceDiscount,
        p.updatedPrice,
        p.price
      );
      const displayMarkedPrice = firstMarkedPriceAboveSale(p, displayPrice);
      const hasDisplayDiscount = typeof displayMarkedPrice === "number";
      return {
        ...p,
        finalPriceDiscount: displayPrice,
        displayPrice,
        displayMarkedPrice,
        hasDisplayDiscount,
      };
    });
  }
}
