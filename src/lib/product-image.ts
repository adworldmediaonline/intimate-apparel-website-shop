/**
 * Product image metadata - matches backend ImageWithMeta schema
 */
export interface ImageWithMeta {
  url: string;
  fileName: string;
  title: string;
  altText: string;
  link?: string;
}

/**
 * Product image from API - fields may be optional
 */
export interface ProductImageMeta {
  url: string;
  fileName?: string;
  title?: string;
  altText?: string;
}

/**
 * Product with optional image metadata
 */
export interface ProductWithImageMeta {
  img?: string;
  image?: ProductImageMeta | ImageWithMeta | null;
  imageURLs?: string[] | (ProductImageMeta | ImageWithMeta)[];
  imageURLsWithMeta?: (ProductImageMeta | ImageWithMeta)[];
  title: string;
}

/**
 * Get main product image URL.
 * Prefers product.image.url, falls back to product.img.
 */
export const getProductImageUrl = (product: ProductWithImageMeta): string => {
  return product.image?.url ?? product.img ?? '';
};

/**
 * Get image src for display. Always uses the /api/image proxy when we have a URL
 * so "Save Image As" uses a proper filename instead of random Cloudinary IDs.
 * Filename is derived from metadata, slug, or title.
 */
export const getProductImageSrc = (product: ProductWithImageMeta): string => {
  const url = getProductImageUrl(product);
  if (!url) return '';
  // Always use proxy so "Save Image As" gets correct filename (not random Cloudinary ID)
  const fileName =
    product.image?.fileName?.trim() ||
    (product as { slug?: string }).slug?.replace(/[^\w-]/g, '-') ||
    (product as { title?: string }).title
      ?.replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) ||
    'product';
  const ext = fileName.includes('.') ? '' : '.webp';
  return `/api/image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName + ext)}`;
};

/**
 * Get image src for display in product cards.
 * Returns direct Cloudinary CDN URL when possible for faster loading (no proxy hop).
 * Falls back to proxy for non-Cloudinary URLs.
 */
export const getProductImageSrcForDisplay = (
  product: ProductWithImageMeta
): string => {
  const url = getProductImageUrl(product);
  if (!url) return '';
  if (isCloudinaryUrl(url)) {
    return url;
  }
  return getProductImageSrc(product);
};

/**
 * Whether the image src is a proxy URL (needs different component than CldImage).
 */
export const isProductImageProxyUrl = (src: string): boolean => {
  return typeof src === 'string' && src.startsWith('/api/image?');
};

/**
 * Whether the URL is a Cloudinary CDN URL (use CldImage with preserveTransformations).
 */
export const isCloudinaryUrl = (url?: string): boolean =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes('/upload/');

/**
 * Ask Cloudinary for a right-sized, modern-format copy of an image.
 *
 * The wireframe components render plain `<img>` against raw Cloudinary URLs,
 * so nothing resized or re-encoded them: the home page pulled 1.6 MB of
 * full-size WebP for images displayed a few hundred pixels wide, and mobile
 * LCP sat at 5.1 s. Cloudinary does this work inside its own URL, which also
 * keeps it off Vercel's image-optimization meter — the reason this is done
 * here rather than by moving the wireframe over to `next/image`.
 *
 * `f_auto` picks AVIF where the browser takes it, `q_auto` sets quality from
 * image content, and `c_limit` only ever shrinks, so a source smaller than
 * `width` is passed through untouched rather than upscaled.
 */
export const cloudinaryVariant = (
  url: string | undefined,
  width: number
): string => {
  if (!isCloudinaryUrl(url)) return url ?? '';
  // Already transformed (hand-built URL, or a second pass): leave it alone.
  // The leading group is optional because the transformation may be the very
  // first segment, as in `/upload/w_300,c_fill/`.
  if (/\/upload\/(?:[^/]*[,_])?(?:f_auto|q_auto|w_\d)/.test(url!)) return url!;
  return url!.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
};

/**
 * `srcSet` offering a slot of `width` CSS pixels at 1x and 2x.
 *
 * Width (`w`) descriptors rather than `1x`/`2x` on purpose: a `sizes`
 * attribute is ignored outright next to `x` descriptors, so the browser would
 * pick on device pixel ratio alone and hand a phone the desktop-sized file
 * however narrow the slot really is.
 */
export const cloudinarySrcSet = (
  url: string | undefined,
  width: number
): string | undefined => {
  if (!isCloudinaryUrl(url)) return undefined;
  return (
    `${cloudinaryVariant(url, width)} ${width}w, ` +
    `${cloudinaryVariant(url, width * 2)} ${width * 2}w`
  );
};

/**
 * Get main product image alt text for accessibility and SEO.
 * Uses product.image.altText when available, else product.image.title, else product.title.
 * Avoids random Cloudinary filenames.
 */
export const getProductImageAlt = (product: ProductWithImageMeta): string => {
  if (product.image?.altText?.trim()) return product.image.altText;
  if (product.image?.title?.trim()) return product.image.title;
  return product.title || 'Product image';
};

/**
 * Get main product image title (for title attribute / tooltip).
 */
export const getProductImageTitle = (product: ProductWithImageMeta): string => {
  if (product.image?.title?.trim()) return product.image.title;
  return product.title || '';
};

/**
 * Get gallery image URLs for display.
 * Returns direct Cloudinary CDN URLs when possible; falls back to proxy for non-Cloudinary.
 */
export const getProductImageSrcsForGalleryForDisplay = (
  product: ProductWithImageMeta
): string[] => {
  const rawUrls = getProductImageUrls(product);
  if (rawUrls.length === 0) return [];
  const proxyUrls = getProductImageSrcsForGallery(product);
  return rawUrls.map((url, i) =>
    isCloudinaryUrl(url) ? url : proxyUrls[i] ?? url
  );
};

/**
 * Get absolute image URLs for schema.org (Product JSON-LD).
 * Uses direct Cloudinary URLs when possible; proxy URLs made absolute for non-Cloudinary.
 */
export const getProductImageUrlsForSchema = (
  product: ProductWithImageMeta,
  toAbsoluteUrl: (url: string) => string
): string[] => {
  const mainUrl = getProductImageUrl(product);
  const mainSrc = isCloudinaryUrl(mainUrl)
    ? mainUrl
    : getProductImageSrc(product);
  const rawUrls = getProductImageUrls(product);
  const proxyUrls = getProductImageSrcsForGallery(product);
  const gallerySrcs = rawUrls.map((url, i) =>
    isCloudinaryUrl(url) ? url : proxyUrls[i] ?? url
  );
  const images = [
    mainSrc,
    ...gallerySrcs.filter((u) => u && u !== mainSrc),
  ].filter(Boolean);
  return images.map((u) =>
    typeof u === 'string' && u.startsWith('http') ? u : toAbsoluteUrl(u)
  );
};

/**
 * Get gallery image URLs - always uses proxy so "Save Image As" gets correct filenames.
 * Filename from metadata, or derived from slug/title + index.
 */
export const getProductImageSrcsForGallery = (
  product: ProductWithImageMeta
): string[] => {
  const rawUrls = getProductImageUrls(product);
  const withMeta = product.imageURLsWithMeta;
  const slug = (product as { slug?: string }).slug?.replace(/[^\w-]/g, '-');
  const baseName =
    slug ||
    (product as { title?: string }).title
      ?.replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) ||
    'product';

  return rawUrls.map((url, i) => {
    const meta = Array.isArray(withMeta) ? withMeta[i] : null;
    const fileName =
      (typeof meta === 'object' && meta?.fileName?.trim()) ||
      (i === 0 ? baseName : `${baseName}-view-${i + 1}`);
    const ext = fileName.includes('.') ? '' : '.webp';
    return `/api/image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName + ext)}`;
  });
};

/**
 * Normalize imageURLs to array of URLs (strings).
 * Handles both legacy string[] and ImageWithMeta[] (imageURLsWithMeta).
 */
export const getProductImageUrls = (product: ProductWithImageMeta): string[] => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta.length > 0) {
    return withMeta.map((item) => (typeof item === 'object' && item?.url ? item.url : String(item)));
  }
  const urls = product.imageURLs;
  if (!Array.isArray(urls)) return [];
  return urls.map((item) =>
    typeof item === 'object' && item && 'url' in item ? (item as ImageWithMeta).url : String(item)
  );
};

/**
 * Get alt text for a variant/gallery image by index.
 */
export const getVariantImageAlt = (
  product: ProductWithImageMeta,
  index: number,
  url: string
): string => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta[index]) {
    const meta = withMeta[index];
    if (typeof meta === 'object' && meta?.altText?.trim()) return meta.altText;
    if (typeof meta === 'object' && meta?.title?.trim()) return meta.title;
    if (typeof meta === 'object' && meta?.fileName?.trim()) return meta.fileName;
  }
  return getProductImageAlt(product) + (index > 0 ? ` - view ${index + 1}` : '');
};

/**
 * Get title (tooltip) for a variant/gallery image by index.
 */
export const getVariantImageTitle = (
  product: ProductWithImageMeta,
  index: number
): string => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta[index]) {
    const meta = withMeta[index];
    if (typeof meta === 'object' && meta?.title?.trim()) return meta.title;
    if (typeof meta === 'object' && meta?.fileName?.trim()) return meta.fileName;
  }
  return getProductImageTitle(product) + (index > 0 ? ` - view ${index + 1}` : '');
};
