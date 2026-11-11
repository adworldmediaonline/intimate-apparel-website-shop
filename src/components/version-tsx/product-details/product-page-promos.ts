// Cross-sell promos shown on product detail pages.
//
// The list is empty for this store — the previous entries were another brand's
// products. The lookup below is kept because `details-wrapper.jsx` and
// `product-details-content.jsx` import it; with an empty list it simply returns
// undefined and no promo renders.
//
// TODO: add promos for this catalogue, or remove this module and its two
// importers if cross-sell is not wanted.

type PromoProduct = {
  slug?: string | null;
  sku?: string | null;
} | null | undefined;

type PromoImage = {
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
};

type ProductPagePromo = {
  slugs?: string[];
  skus?: string[];
  topBanner?: PromoImage;
  offerBanner?: PromoImage;
};

export const PRODUCT_PAGE_PROMOS: ProductPagePromo[] = [];

export const getProductPagePromo = (product: PromoProduct) => {
  const slug = String(product?.slug || '').trim().toLowerCase();
  const sku = String(product?.sku || '').trim().toUpperCase();

  return PRODUCT_PAGE_PROMOS.find((promo) => {
    const hasSlug = promo.slugs?.some(
      (promoSlug) => promoSlug.trim().toLowerCase() === slug
    );
    const hasSku = promo.skus?.some(
      (promoSku) => promoSku.trim().toUpperCase() === sku
    );

    return hasSlug || hasSku;
  });
};
