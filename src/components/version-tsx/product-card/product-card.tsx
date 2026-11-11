'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Play, X, Youtube } from 'lucide-react';
import * as React from 'react';
import { notifyError } from '@/utils/toast';
import { useAddToCartAnimation } from '@/context/add-to-cart-animation-context';
import type { Product, ProductBase, WishlistProduct } from '@/types/product';

const ProductConfigurationDialog = dynamic(
  () =>
    import('@/components/version-tsx/product-configuration-dialog').then(
      (mod) => mod.default
    ),
  { ssr: false }
);
import { ProductCardImage } from './product-card-image';
import { ProductCardInfo } from './product-card-info';
import { ProductCardPrice } from './product-card-price';
import { ProductCardActions } from './product-card-actions';
import { resolveCartItemPrice } from '@/lib/product-price';
import { isOutOfStock } from '@/lib/product-stock';
import { useProductCard } from './use-product-card';

export type ProductCardVariant = 'shop' | 'related' | 'search' | 'wishlist';
export type ProductCardLayout = 'vertical' | 'horizontal';

export interface ProductCardProps {
  product: ProductBase | Product | WishlistProduct;
  onAddToCart?: (product: ProductBase & { finalPriceDiscount?: number; basePrice?: number; appliedCouponCode?: string }, selectedOption?: { title: string; price: number }) => void;
  onAddToWishlist?: (product: ProductBase) => void;
  onDecrementFromCart?: (product: ProductBase & { finalPriceDiscount?: number; selectedOption?: { title: string; price: number } }) => void;
  onRemoveFromWishlist?: (product: { id: string; title: string }) => void;
  index?: number;
  variant?: ProductCardVariant;
  layout?: ProductCardLayout;
  seo?: { nofollow?: boolean; lowPriority?: boolean };
  showCategory?: boolean;
  showSku?: boolean;
  badgeVariant?: 'default' | 'top-left' | 'top-right';
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  onDecrementFromCart,
  onRemoveFromWishlist,
  index = 0,
  variant = 'shop',
  layout = 'vertical',
  seo = {},
  showCategory = false,
  showSku = false,
}: ProductCardProps): React.ReactElement {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<{ title: string; price: number } | null>(
    (product as WishlistProduct).selectedOption ?? null
  );
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);
  const addToCartAnimation = useAddToCartAnimation();

  const productWithOptions = product as ProductBase & {
    options?: Array<{ title: string; price: number }>;
    productConfigurations?: Array<{
      title: string;
      options: Array<{ name: string; price: number; isSelected: boolean }>;
    }>;
  };

  const {
    isAddedToCart,
    isAddedToWishlist,
    hasProductDiscount,
    hasConfigurations,
    imageSrc,
    imageAlt,
    imageTitle,
    useProxyForFilename,
    isCloudinaryAsset,
    shouldEagerLoad,
    shouldUseHighPriority,
    averageRating,
    cartQuantity,
    calculateFinalPrice,
    calculateMarkedPrice,
    showMarkedPrice,
  } = useProductCard({
    product: productWithOptions,
    selectedOption,
    index,
  });

  const productSlug = product.slug || product._id;
  const videoId = (product as Product).videoId;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasConfigurations) {
      setIsConfigDialogOpen(true);
      return;
    }

    if (productWithOptions.options?.length && !selectedOption) {
      notifyError('Please select an option before adding the product to your cart.');
      return;
    }

    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = resolveCartItemPrice(product, optionPrice);

    if (addToCartAnimation && imageSrc && variant === 'shop') {
      const sourceRect = imageContainerRef.current?.getBoundingClientRect();
      if (sourceRect) {
        addToCartAnimation.triggerAddToCartAnimation(
          { _id: product._id, img: imageSrc, title: product.title },
          sourceRect
        );
      }
    }

    const productToAdd = {
      ...product,
      finalPriceDiscount: finalPrice,
      basePrice: Number(product.displayMarkedPrice ?? product.finalPriceDiscount ?? 0),
    };
    onAddToCart?.(productToAdd as never, selectedOption ?? undefined);
  };

  const handleChooseOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfigDialogOpen(true);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productWithOption = {
      ...product,
      selectedOption: selectedOption || undefined,
      options: productWithOptions.options,
      productConfigurations: productWithOptions.productConfigurations,
    };
    onAddToWishlist?.(productWithOption);
  };

  const handleOptionChange = (value: string) => {
    if (value === '') {
      setSelectedOption(null);
    } else {
      const optionIndex = parseInt(value);
      setSelectedOption(productWithOptions.options?.[optionIndex] ?? null);
    }
  };

  const handleDecrementFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = resolveCartItemPrice(product, optionPrice);
    const productToDecrement = {
      ...product,
      finalPriceDiscount: finalPrice,
      sku: product.sku ?? product._id ?? '',
      shipping: product.shipping || { price: 0 },
      selectedOption: selectedOption ?? undefined,
    };
    onDecrementFromCart?.(productToDecrement);
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromWishlist?.({ id: product._id, title: product.title });
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoModalOpen(true);
    setIsVideoPlaying(false);
  };

  const handleVideoModalClose = (open: boolean) => {
    setIsVideoModalOpen(open);
    if (!open) setIsVideoPlaying(false);
  };

  const loading = seo.lowPriority ? 'lazy' : shouldEagerLoad ? 'eager' : 'lazy';
  const fetchPriority = seo.lowPriority ? 'low' : shouldUseHighPriority ? 'high' : undefined;
  const priority = !seo.lowPriority && shouldEagerLoad;

  const finalPrice = calculateFinalPrice();
  const markedPrice = calculateMarkedPrice();

  const imageSection = (
    <ProductCardImage
      productSlug={productSlug}
      productId={product._id}
      productTitle={product.title}
      outOfStock={isOutOfStock(product)}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      imageTitle={imageTitle}
      useProxyForFilename={useProxyForFilename}
      isCloudinaryAsset={isCloudinaryAsset}
      loading={loading}
      fetchPriority={fetchPriority}
      priority={priority}
      onLoad={() => setIsImageLoading(false)}
      isImageLoading={isImageLoading}
      isHovered={isHovered}
      imageContainerRef={imageContainerRef}
      videoId={videoId}
      onVideoClick={videoId ? handleVideoClick : undefined}
      showQuickActions={!!onAddToWishlist || !!onAddToCart}
      hideQuickActionsOnMobile={variant === 'shop'}
      quickActionsTop="top-2"
      onAddToWishlist={handleAddToWishlist}
      onAddToCart={handleAddToCart}
      isAddedToWishlist={isAddedToWishlist}
      isAddedToCart={isAddedToCart}
      linkPrefetch={!seo.lowPriority}
      linkRel={seo.nofollow ? 'nofollow' : undefined}
      aspectRatio={layout === 'horizontal' ? 'auto' : 'square'}
      linkClassName={layout === 'horizontal' ? 'h-full w-full' : ''}
    />
  );

  const infoSection = (
    <div
      className={`flex flex-col h-full px-2 pb-3 pt-1 sm:px-4 sm:pb-4 flex-1 min-w-0 ${
        variant === 'related' ? 'min-h-0' : ''
      }`}
    >
      <ProductCardInfo
        product={product}
        productSlug={productSlug}
        averageRating={averageRating}
        showCategory={showCategory}
        showSku={showSku}
        categoryName={product.category?.name}
        sku={product.sku}
        useTitleSegments={variant !== 'search'}
      />

      <ProductCardPrice
        finalPrice={finalPrice}
        markedPrice={markedPrice}
        showMarkedPrice={showMarkedPrice}
      />

      <ProductCardActions
        product={{ ...productWithOptions, slug: productSlug }}
        hasConfigurations={hasConfigurations}
        selectedOption={selectedOption}
        onOptionChange={handleOptionChange}
        onAddToCart={handleAddToCart}
        onChooseOptions={handleChooseOptions}
        onDecrementFromCart={variant === 'wishlist' ? handleDecrementFromCart : undefined}
        onRemoveFromWishlist={variant === 'wishlist' ? handleRemoveFromWishlist : undefined}
        isAddedToCart={isAddedToCart}
        cartQuantity={cartQuantity}
        variant={variant}
        layout={layout}
      />
    </div>
  );

  return (
    <>
      <Card
        className={`group rounded-md relative overflow-hidden transition-all duration-300 hover:shadow-lg p-0 ${
          layout === 'horizontal'
            ? 'flex flex-col sm:flex-row'
            : `flex flex-col ${variant === 'related' ? 'h-full min-h-0 flex-1' : ''}`
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {layout === 'horizontal' ? (
          <>
            <div className="relative w-full sm:w-32 h-32 sm:h-32 shrink-0 bg-muted overflow-hidden">
              {imageSection}
            </div>
            {infoSection}
          </>
        ) : (
          <>
            <div className={variant === 'related' ? 'shrink-0' : ''}>
              {imageSection}
            </div>
            {infoSection}
          </>
        )}
      </Card>

      {hasConfigurations && (
        <ProductConfigurationDialog
          product={product as Product}
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
          onAddToCart={onAddToCart as (p: Product) => void}
        />
      )}

      {videoId && (
        <Dialog open={isVideoModalOpen} onOpenChange={handleVideoModalClose}>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-0">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-4 bg-linear-to-b from-black/80 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-white text-sm sm:text-base font-medium line-clamp-2">
                  {product.title}
                </DialogTitle>
                <button
                  onClick={() => handleVideoModalClose(false)}
                  className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 transition-colors"
                  aria-label="Close video"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </button>
              </div>
            </DialogHeader>

            <div className="relative w-full aspect-video bg-black">
              {!isVideoPlaying ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={`${product.title} video thumbnail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300">
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="transform transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Play video"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50" />
                        <div className="relative bg-red-600 hover:bg-red-700 rounded-full p-4 sm:p-6 shadow-2xl border-4 border-white/90">
                          <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white fill-white ml-0.5 sm:ml-1" />
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2">
                      <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      <span className="text-white text-xs sm:text-sm font-medium">Watch on YouTube</span>
                    </div>
                  </div>
                  <div className="absolute top-14 sm:top-16 left-3 sm:left-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-[10px] sm:text-xs font-semibold">
                      HD
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${product.title} - Product Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              )}
            </div>

            <div className="bg-linear-to-t from-black to-zinc-900 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
                <Youtube className="h-4 w-4 text-red-600" />
                <span>Product Video</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Open in YouTube
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
