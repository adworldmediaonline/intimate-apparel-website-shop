'use client';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';

interface BannerProps {
  desktopPublicId: string;
  mobilePublicId?: string;
  desktopTitle?: string;
  mobileTitle?: string;

  href?: string;
  priority?: boolean;
  showButton?: boolean;
  buttonText?: string;
  gradientPosition?: 'left' | 'right' | 'center';
  aspectRatio?: number;
  mobileHeight?: number;
  showPromoContent?: boolean;
  promoCode?: string;
}

export default function Banner({
  desktopPublicId,
  mobilePublicId,
  desktopTitle,
  mobileTitle,

  priority = false,

  gradientPosition = 'left',
  aspectRatio = 3.69,
  mobileHeight = 200,
}: BannerProps) {
  const mobileImage = mobilePublicId || desktopPublicId;

  const getAspectRatio = () => {
    if (aspectRatio) return aspectRatio;
    return 1920 / 520; // Default 1920/520
  };

  const getGradientClasses = () => {
    switch (gradientPosition) {
      case 'right':
        return 'right-0 bg-gradient-to-l from-black/70 to-transparent';
      case 'center':
        return 'inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent';
      default:
        return 'left-0 bg-gradient-to-r from-black/70 to-transparent';
    }
  };

  const getGradientWidth = () => {
    switch (gradientPosition) {
      case 'right':
        return 'w-[45%] lg:w-[36%] xl:w-[32%]';
      case 'center':
        return 'w-full';
      default:
        return 'w-[45%] lg:w-[36%] xl:w-[32%]';
    }
  };

  return (
    <section aria-label="Banner" className="relative w-full">
      {/* Desktop / Large screens */}
      <Link href="/coupon" className="relative hidden md:block w-full">
        <AspectRatio ratio={getAspectRatio()} className="w-full">
          <CldImage
            alt={desktopTitle || 'Banner image'}
            src={desktopPublicId}
            fill
            sizes="100vw"
            priority={priority}
            quality={90}
            className="object-cover"
            crop="fill"
            gravity="center"
          />
          <div
            className={`pointer-events-none absolute inset-y-0 ${getGradientClasses()} ${getGradientWidth()}`}
          />
        </AspectRatio>
      </Link>

      {/* Mobile / Small screens */}
      <Link href="/coupon" className="relative block md:hidden w-full">
        <div
          className="relative w-full"
          style={{ height: `${mobileHeight}px` }}
        >
          <CldImage
            alt={mobileTitle || desktopTitle || 'Banner image'}
            src={mobileImage}
            fill
            sizes="100vw"
            priority={priority}
            quality={85}
            className="object-contain"
            crop="fill"
            gravity="center"
          />
          <div
            className={`pointer-events-none absolute inset-y-0 ${getGradientClasses()} ${
              gradientPosition === 'center' ? 'w-full' : 'w-3/4 sm:w-1/2'
            }`}
          />
        </div>
      </Link>
    </section>
  );
}
