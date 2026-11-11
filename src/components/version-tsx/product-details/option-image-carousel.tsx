'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import {
  getProductImageSrcsForGalleryForDisplay,
  getVariantImageAlt,
  getVariantImageTitle,
  type ProductImageMeta,
  type ProductWithImageMeta,
} from '@/lib/product-image';

interface OptionImageCarouselProps {
  /** The full product, used only for image alt/title fallbacks. */
  productItem?: Partial<ProductWithImageMeta> | null;
  /** The selected configuration option's gallery images. */
  images: ProductImageMeta[];
  /** Optional heading label (e.g. the selected option name). */
  label?: string;
}

/**
 * Renders the currently-selected configuration option's images as a carousel
 * below the main product image. Selecting a different finish/config option swaps
 * the images shown here; the main gallery/thumbnails are left untouched.
 * Renders nothing when the selected option has no gallery images.
 */
export default function OptionImageCarousel({
  productItem,
  images,
  label,
}: OptionImageCarouselProps) {
  if (!Array.isArray(images) || images.length === 0) return null;

  // Reuse the product gallery display transform (cloudinary direct vs /api/image proxy)
  // by treating the option's gallery as a product-like object.
  const syntheticProduct = {
    ...(productItem ?? {}),
    imageURLsWithMeta: images,
    // Ensure imageURLs doesn't shadow imageURLsWithMeta in the URL resolver.
    imageURLs: undefined,
  } as ProductWithImageMeta;

  const srcs = getProductImageSrcsForGalleryForDisplay(syntheticProduct);
  if (srcs.length === 0) return null;

  return (
    <div className="mt-6 mb-16">
      <p className="mb-3 text-sm font-semibold text-foreground">
        {label ? label : 'Selected configuration'}
      </p>
      <Carousel
        opts={{ align: 'start', loop: srcs.length > 1 }}
        className="w-full"
      >
        <CarouselContent>
          {srcs.map((src, i) => (
            <CarouselItem
              key={`${src}-${i}`}
              // One image per view, full column width — matches the main preview image.
              className="basis-full"
            >
              <div className="overflow-hidden rounded-lg border bg-card">
                <div className="flex w-full items-center justify-center bg-gray-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={getVariantImageAlt(syntheticProduct, i, src)}
                    title={getVariantImageTitle(syntheticProduct, i) || undefined}
                    loading="lazy"
                    decoding="async"
                    // Keep the image's natural aspect ratio; only cap the height.
                    className="h-auto w-auto max-h-[500px] max-w-full object-contain"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {srcs.length > 1 && (
          <>
            <CarouselPrevious className="left-1" type="button" />
            <CarouselNext className="right-1" type="button" />
          </>
        )}
      </Carousel>
    </div>
  );
}
