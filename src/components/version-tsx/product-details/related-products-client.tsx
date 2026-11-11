'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

interface RelatedProductsClientProps {
  products: any[];
  currentProductId: string;
}

/**
 * Client component for related products interactivity
 * Handles Swiper slider and user interactions (cart, wishlist)
 */
export default function RelatedProductsClient({
  products,
  currentProductId,
}: RelatedProductsClientProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const { handleAddToCart, handleAddToWishlist } = useShopActions();

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextSlide = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        /* Ensure all slides stretch to equal height (tallest card in row).
           Swiper sets .swiper-slide to height:100% + flex-shrink:0, which prevents
           align-items:stretch from working. height:unset fixes this. */
        .related-products-swiper .swiper-wrapper {
          align-items: stretch;
        }
        .related-products-swiper .swiper-slide {
          height: unset;
          display: flex;
        }
        .related-products-swiper .swiper-slide > div {
          width: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
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
          loop={products.length > 4}
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
          {products.map((product: any) => (
            <SwiperSlide key={product._id}>
              <div className="h-full w-full min-h-full flex flex-col">
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
}

