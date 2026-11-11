import { cache } from "react";
import { API_ENDPOINT } from "./api-endpoint";
import { enrichProductsWithDisplayPrices } from "@/server/enrich-products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PaginatedProductsResponse {
  data: unknown[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** Server-side fetch for initial shop products (SSR). No caching. */
export async function getPaginatedProductsServer(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subcategory?: string;
    color?: string;
    homeRow?: 'bestsellers' | 'new-arrivals';
    sortBy?: string;
    sortOrder?: string;
    /**
     * Ask for the light document shape: `hasOptions` and `variantImage` instead
     * of the full `productConfigurations`, which is ~94% of the payload. Only
     * for grids - anything rendering the variant picker needs the full shape.
     */
    slim?: boolean;
  } = {}
): Promise<PaginatedProductsResponse | null> {
  if (!API_BASE_URL?.trim()) return null;

  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false) return;
      searchParams.append(key, value === true ? "1" : String(value));
    });
    const url = `${API_BASE_URL}/api/product/paginated?${searchParams.toString()}`;
    /**
     * Cached for a minute, keyed by the full query string.
     *
     * Filtering is a server round-trip per click, and `no-store` made every
     * one of them a fresh database read - toggling a colour off and on again,
     * or pressing back, paid the full cost twice. A minute is short enough that
     * a price or stock edit shows up promptly and long enough that browsing
     * feels instant.
     */
    const response = await fetch(url, {
      // A day. Safe because every product mutation in the admin busts the
      // `products` tag (see revalidateProductPages), so an edit shows up at
      // once rather than waiting for this window to run out.
      next: {
        revalidate: 86400,
        tags: params.homeRow ? ["products", "home-rows"] : ["products"],
      },
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (!json?.success || !Array.isArray(json?.data)) return null;
    return {
      data: json.data,
      pagination: json.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalProducts: json.data.length,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null; // Expected when request is aborted (navigation, etc.)
    }
    console.error("Error fetching paginated products:", error);
    return null;
  }
}

export interface ProductColour {
  name: string;
  slug: string;
  count: number;
}

/**
 * Distinct colours across the catalogue, for the shop's colour facet.
 *
 * Colours are stored as option names under each product's "Colour"
 * configuration, so the backend aggregates them; there is no colour field to
 * read. Returns [] on any failure — the shop must render without the facet.
 */
export async function getProductColours(): Promise<ProductColour[]> {
  if (!API_BASE_URL?.trim()) return [];

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.PRODUCT_COLOURS}`, {
      next: { revalidate: 86400, tags: ["products"] },
    });
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json?.data) ? (json.data as ProductColour[]) : [];
  } catch {
    return [];
  }
}

export async function getProductsShow() {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SHOW}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    if (!data?.result) {
      throw new Error("No products found");
    }
    return data.result;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Minimal product fetch for breadcrumb - no enrichment, no coupon fetch.
 * Returns raw product with category and title only.
 */
async function getProductSingleMinimalInternal(id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SINGLE}/${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const data = await response.json();
    return data ?? null;
  } catch (error) {
    console.error("Error fetching product (minimal):", error);
    return null;
  }
}

export const getProductSingleMinimal = cache(getProductSingleMinimalInternal);

/**
 * Full product fetch with price enrichment. Deduplicated by React cache() within request.
 */
async function getProductSingleInternal(id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SINGLE}/${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const data = await response.json();
    if (!data) return null;

    const [enriched] = await enrichProductsWithDisplayPrices([data]);
    return enriched ?? data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export const getProductSingle = cache(getProductSingleInternal);

/**
 * Cached, price-enriched product fetch used for the product page's METADATA, JSON-LD
 * schema, and server-rendered body.
 *
 * Uses `'use cache'` (cacheComponents) so the page's metadata (og:image/title), the
 * Product JSON-LD, and the body content are PRERENDERED into the static HTML shell that
 * Vercel serves — visible to view-source / Schema.org validator / non-JS crawlers —
 * instead of being deferred into a streamed Suspense block.
 *
 * Enrichment (`enrichProductsWithDisplayPrices`) is pure price math (no fetch/cookies/
 * time), so it is safe to run inside the cache and gives the body correct display prices.
 *
 * Tagged `product-schema` so the admin panel can revalidate on product edits via the
 * existing /api/revalidate route (price/stock edits → revalidate to refresh the shell).
 */
export async function getProductForSchema(id: string) {
  "use cache";
  const { cacheTag, cacheLife } = await import("next/cache");
  cacheTag("product-schema", `product-schema:${id}`);
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PRODUCTS_SINGLE}/${id}`
    );
    if (!response.ok) {
      // IMPORTANT: never persist a "not found" for hours. A newly created or
      // just-published product whose page is first rendered while the lookup
      // still misses (draft window, propagation lag, transient API blip) would
      // otherwise bake "Product not found" into the ISR/prerendered page for the
      // full `hours` TTL — with nothing to bust it (search uses no-store, so it
      // keeps showing the product, exactly the reported mismatch). Cache the
      // negative result only briefly so the page self-heals on the next request.
      cacheLife("seconds");
      return null;
    }
    const data = await response.json();
    if (!data) {
      cacheLife("seconds");
      return null;
    }
    // Positive result: cache for hours as before. Admin edits/publishes bust the
    // `product-schema:${id}` tag on-demand (see admin revalidation wiring).
    cacheLife("days");
    const [enriched] = await enrichProductsWithDisplayPrices([data]);
    return enriched ?? data;
  } catch (error) {
    cacheLife("seconds");
    console.error("Error fetching product (cached):", error);
    return null;
  }
}

export async function getRelatedProducts(id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PRODUCTS_RELATED}/${id}`,
      {
        // Was `no-store`, so every product page view pulled this from the
        // origin. Related products only change when the catalogue does, and
        // the `products` tag is already busted on admin edits.
        next: { revalidate: 86400, tags: ["products"] },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch related products");
    }
    const data = await response.json();

    const relatedProducts =
      data?.data?.filter((p: { _id: string }) => p._id !== id).slice(0, 8) || [];

    return relatedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}
