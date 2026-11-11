'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { isOutOfStock } from '@/lib/product-stock';
import DetailsWrapper from './details-wrapper';
import ProductVideoPlayer from './product-video-player';
import { getProductPagePromo } from './product-page-promos';
import {
  getProductImageUrl,
  getProductImageAlt,
  getProductImageTitle,
} from '@/lib/product-image';

const DetailsThumbWrapper = dynamic(
  () => import('./details-thumb-wrapper').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="aspect-square w-full max-h-[500px] rounded-lg bg-muted/20 animate-pulse" />
        <div className="flex gap-3 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-16 shrink-0 rounded-lg bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  }
);
import ProductDetailsFixedBar from './product-details-fixed-bar';
import OptionImageCarousel from './option-image-carousel';
import {
  getProductImageSrcForDisplay,
  getProductImageSrcsForGalleryForDisplay,
} from '@/lib/product-image';

export default function ProductDetailsContent({ productItem, children }) {
  const mainImg = getProductImageSrcForDisplay(productItem || {});
  let imageURLs = getProductImageSrcsForGalleryForDisplay(productItem || {});
  // When product has only main image (no variants), include it in gallery
  if (imageURLs.length === 0 && mainImg) {
    imageURLs = [mainImg];
  }
  const { videoId } = productItem || {};
  const outOfStock = isOutOfStock(productItem);
  const productPromo = getProductPagePromo(productItem);
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || mainImg);
  // Images (+ label) for the currently-selected configuration option, shown as a
  // carousel below the main image. Lifted here from DetailsWrapper so the carousel
  // can render in the left/image column while the config selector stays on the right.
  const [selectedOptionGallery, setSelectedOptionGallery] = useState({
    images: [],
    label: '',
  });
  const addToCartRef = useRef(null);
  const proceedToBuyRef = useRef(null);

  /**
   * Primary product image for server-side render (initial HTML).
   * The interactive gallery (DetailsThumbWrapper) is loaded with `ssr: false`, so
   * without this the product image would only appear after client JS runs — which
   * means Googlebot / social crawlers never see it in the HTML. We render the raw
   * absolute Cloudinary URL as a plain <img> so the primary image is present in the
   * initial server HTML. Once the interactive gallery hydrates we hide this fallback
   * to avoid a duplicate image.
   */
  const ssrPrimaryImg = getProductImageUrl(productItem || {});
  const ssrPrimaryAlt = getProductImageAlt(productItem || {});
  const ssrPrimaryTitle = getProductImageTitle(productItem || {});
  const [galleryHydrated, setGalleryHydrated] = useState(false);
  useEffect(() => {
    // Defer to next frame so the interactive gallery has mounted before we hide
    // the SSR fallback, preventing a flash of empty space.
    const id = requestAnimationFrame(() => setGalleryHydrated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // handle image active - useCallback to prevent DetailsWrapper useEffect from resetting on every render
  const handleImageActive = useCallback((img) => {
    setActiveImg(img);
  }, []);

  // Receives the selected option's gallery images + label from DetailsWrapper.
  const handleOptionGalleryChange = useCallback((images, label) => {
    setSelectedOptionGallery({
      images: Array.isArray(images) ? images : [],
      label: label || '',
    });
  }, []);

  return (
    <>
      {productPromo?.topBanner && (
        <section className="mb-6 overflow-hidden rounded-lg border border-border bg-background">
          <Image
            src={productPromo.topBanner.src}
            alt={productPromo.topBanner.alt}
            title={productPromo.topBanner.title}
            width={productPromo.topBanner.width}
            height={productPromo.topBanner.height}
            className="h-auto w-full object-cover"
            sizes="(min-width: 1280px) 1216px, calc(100vw - 32px)"
            priority
          />
        </section>
      )}

      {/* Main product section - Desktop: Side by side, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image gallery - Desktop: Sticky left column, Mobile: First */}
        <div className="order-1 lg:order-1">
          <div className="lg:sticky lg:top-4">
            {/*
              Server-rendered primary image — guarantees the product image is in the
              initial HTML (SSR) for SEO/crawlers, since the interactive gallery below
              is client-only (ssr: false). Hidden once the gallery hydrates.
            */}
            {ssrPrimaryImg && !galleryHydrated && (
              <div className="space-y-6" aria-hidden={galleryHydrated}>
                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="w-full bg-gray-50 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ssrPrimaryImg}
                      alt={ssrPrimaryAlt}
                      title={ssrPrimaryTitle || undefined}
                      width={580}
                      height={580}
                      fetchPriority="high"
                      decoding="async"
                      className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={ssrPrimaryImg && !galleryHydrated ? 'hidden' : ''}>
              <DetailsThumbWrapper
                activeImg={activeImg}
                handleImageActive={handleImageActive}
                imageURLs={imageURLs}
                productItem={productItem}
                imgWidth={580}
                imgHeight={580}
                videoId={videoId}
                outOfStock={outOfStock}
              />
            </div>

            {/* Selected configuration option's images (carousel below main image) */}
            <OptionImageCarousel
              productItem={productItem}
              images={selectedOptionGallery.images}
              label={selectedOptionGallery.label}
            />
          </div>
        </div>

        {/* Product details - Desktop: Right column, Mobile: Second */}
        <div className="order-2 lg:order-2">
          <DetailsWrapper
            productItem={productItem}
            handleImageActive={handleImageActive}
            activeImg={activeImg}
            onSelectedOptionGalleryChange={handleOptionGalleryChange}
            onAddToCartRef={addToCartRef}
            onProceedToBuyRef={proceedToBuyRef}
          />
        </div>
      </div>

      {/* Product Video Section - Compact spacing */}
      {videoId && (
        <div className="mb-12">
          <ProductVideoPlayer
            videoId={videoId}
            productTitle={productItem?.title}
          />
        </div>
      )}

      {/* More Details - Renders above Related Products */}
      {productItem?.moreDetails && productItem.moreDetails.trim() !== '' && (
        <div className="mb-16">
          <section
            className="prose prose-sm max-w-none text-foreground [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto"
            dangerouslySetInnerHTML={{ __html: productItem.moreDetails }}
          />
        </div>
      )}

      {/* Related Products - Passed as children slot from parent */}
      {children}

      {/* Fixed Bottom Bar for Mobile */}
      <ProductDetailsFixedBar
        productItem={productItem}
        onAddToCart={(prd) => addToCartRef.current?.(prd)}
      />
    </>
  );
}
