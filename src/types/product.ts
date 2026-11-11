/**
 * Shared product types for ProductCard and related components.
 * ProductBase is the minimal shape; Product extends it with full shop features.
 */

export interface ProductImageMeta {
  url: string;
  fileName?: string;
  title?: string;
  altText?: string;
  link?: string;
}

export interface ProductBase {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  img?: string;
  image?: ProductImageMeta | null;
  imageURLs?: string[];
  imageURLsWithMeta?: ProductImageMeta[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  /** Pre-computed display price (after all discounts). From server enrichment. */
  displayPrice?: number;
  /** Pre-computed marked price (original base). From server enrichment. */
  displayMarkedPrice?: number;
  /** Whether to show discount styling. From server enrichment. */
  hasDisplayDiscount?: boolean;
  category?: {
    name: string;
    id?: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: Array<{ rating: number }>;
}

export interface Product extends Omit<ProductBase, 'category'> {
  category: {
    name: string;
    id: string;
  };
  options?: Array<{
    title: string;
    price: number;
  }>;
  productConfigurations?: Array<{
    title: string;
    options: Array<{
      name: string;
      price: number;
      isSelected: boolean;
      image?: string;
      imageWithMeta?: ProductImageMeta | null;
      /** Per-option gallery images shown as a carousel below the main image */
      imageURLsWithMeta?: ProductImageMeta[];
    }>;
  }>;
  /** Override price when specific configuration combinations are selected */
  configurationPriceOverrides?: Array<{
    match: Array<{ configIndex: number; optionName: string }>;
    overridePrice: number;
  }>;
  videoId?: string;
  badges?: string[];
}

/** Related product - minimal; slug may be _id for product details */
export type RelatedProduct = ProductBase;

/** Wishlist product - may have saved selectedOption/options/configurations */
export interface WishlistProduct extends ProductBase {
  selectedOption?: {
    title: string;
    price: number;
  };
  options?: Array<{
    title: string;
    price: number;
  }>;
  productConfigurations?: Array<{
    title: string;
    options: Array<{
      name: string;
      price: number;
      isSelected: boolean;
      image?: string;
      imageWithMeta?: ProductImageMeta | null;
      /** Per-option gallery images shown as a carousel below the main image */
      imageURLsWithMeta?: ProductImageMeta[];
    }>;
  }>;
}
