'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetRelatedProductsQuery } from '@/redux/features/productApi';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import ProductCard from '@/components/version-tsx/product-card';
import { useShopActions } from '@/features/shop/hooks/use-shop-actions';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

interface RelatedProductsSliderProps {
  id: string;
}

const RelatedProductsSlider = ({ id }: RelatedProductsSliderProps) => {
  const { data: products, isError, isLoading } = useGetRelatedProductsQuery(id);
  const swiperRef = useRef<SwiperType | null>(null);
  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  // Filter out the current product and limit to 8 related products
  const relatedProducts =
    products?.data?.filter((p: any) => p._id !== id).slice(0, 8) || [];

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextSlide = () => {
    swiperRef.current?.slideNext();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Related Products
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover more products you might like
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error Loading Related Products
        </h3>
        <p className="text-muted-foreground mb-6">
          We encountered an issue while loading related products.
        </p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Related Products Found
        </h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find any related products at the moment.
        </p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .related-products-swiper .swiper-wrapper {
          align-items: stretch;
        }
        .related-products-swiper .swiper-slide {
          height: auto;
          display: flex;
        }
        .related-products-swiper .swiper-slide > div {
          width: 100%;
        }
      `}</style>
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Related Products
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover more products you might like
          </p>
        </div>

        {/* Navigation Buttons - Desktop Only */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            rounded="full"
            onClick={handlePrevSlide}
            className="h-10 w-10 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            rounded="full"
            onClick={handleNextSlide}
            className="h-10 w-10 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={16}
          slidesPerView={2}
          autoplay={{
            delay: 5000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          loop={relatedProducts.length > 4}
          speed={600}
          grabCursor={true}
          watchSlidesProgress={true}
          breakpoints={{
            0: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="related-products-swiper pb-2"
        >
          {relatedProducts.map((product: any) => (
            <SwiperSlide key={product._id} className="h-auto">
              <div className="h-full">
                <ProductCard
                  product={product}
                  variant="related"
                  seo={{ nofollow: true, lowPriority: true }}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Mobile Navigation Dots */}
        <div className="flex lg:hidden justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            rounded="full"
            onClick={handlePrevSlide}
            className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            rounded="full"
            onClick={handleNextSlide}
            className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductsSlider;

