import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { HeroSectionContent } from '@/server/page-sections';

interface CmsHeroSectionProps {
  content: HeroSectionContent;
}

const HERO_IMAGE_LINK_FALLBACK = '/shop';

/** Use CMS link when present; otherwise full-bleed hero image still navigates to shop. */
const heroImageHref = (link?: string) =>
  link?.trim() ? link.trim() : HERO_IMAGE_LINK_FALLBACK;

export default function CmsHeroSection({ content }: CmsHeroSectionProps) {
  const {
    variant,
    image,
    heading,
    description,
    smallSubDescription,
    cta,
    mobileImage,
    mobileHeading,
    mobileDescription,
    mobileSmallSubDescription,
    mobileCta,
  } = content;

  const showImage = variant === 'image_only' || variant === 'image_content';
  const showContent = variant === 'image_content' || variant === 'content_only';

  const imageAlt = image?.altText || image?.title || heading || 'Hero';
  const imageUrl = image?.url;
  const mobileImageUrl = mobileImage?.url ?? imageUrl;
  const mobileImageAlt = mobileImage?.altText || mobileImage?.title || mobileHeading || heading || 'Hero mobile';

  const contentHeading = heading || '';
  const contentDesc = description || '';
  const contentSmall = smallSubDescription || '';
  const contentCta = cta;

  const mHeading = mobileHeading ?? contentHeading;
  const mDesc = mobileDescription ?? contentDesc;
  const mSmall = mobileSmallSubDescription ?? contentSmall;
  const mCta = mobileCta ?? contentCta;

  const ContentBlock = ({
    h = contentHeading,
    d = contentDesc,
    s = contentSmall,
    c = contentCta,
  }: {
    h?: string;
    d?: string;
    s?: string;
    c?: { text: string; link: string };
  } = {}) =>
    showContent && (h || d || s || c?.text) ? (
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          {h && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-lg">
              {h}
            </h1>
          )}
          {d && (
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white/90 mb-3 md:mb-4 drop-shadow-md">
              {d}
            </h2>
          )}
          {s && (
            <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-5 leading-relaxed font-medium drop-shadow-md">
              {s}
            </p>
          )}
          {c?.text && (
            <Button
              asChild
              size="lg"
              className="rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 text-base md:text-lg h-auto group py-2.5 bg-primary text-primary-foreground"
            >
              <Link href={c.link || '/shop'} className="inline-flex items-center gap-2">
                {c.text}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    ) : null;

  if (variant === 'content_only') {
    const hasMobileContent = mHeading || mDesc || mSmall || mCta?.text;
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[1]" />
        <div className="relative z-[2] flex items-center">
          {/* Desktop content */}
          <div className="hidden md:flex w-full items-center">
            <ContentBlock />
          </div>
          {/* Mobile content – use mobile override when available */}
          <div className="flex md:hidden w-full items-center">
            <ContentBlock
              h={hasMobileContent ? mHeading : contentHeading}
              d={hasMobileContent ? mDesc : contentDesc}
              s={hasMobileContent ? mSmall : contentSmall}
              c={hasMobileContent ? mCta : contentCta}
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'image_only' && (imageUrl || mobileImageUrl)) {
    const desktopSrc = imageUrl ?? mobileImageUrl;
    const desktopImg = image ?? mobileImage;
    const DesktopImage = () => {
      if (!desktopSrc) return null;
      const wrapperClassName = 'block relative w-full aspect-[1920/800]';
      const imageEl = (
        <Image
          src={desktopSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1920px"
          className="object-cover"
        />
      );
      return (
        <Link href={heroImageHref(desktopImg?.link)} className={wrapperClassName}>
          {imageEl}
        </Link>
      );
    };
    //
    const mobileImg = mobileImage ?? image;
    const MobileImage = () => {
      if (!mobileImageUrl) return null;
      const wrapperClassName = 'block relative w-full aspect-[480/511]';
      const imageEl = (
        <Image
          src={mobileImageUrl}
          alt={mobileImageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1920px"
          className="object-cover"
        />
      );
      return (
        <Link href={heroImageHref(mobileImg?.link)} className={wrapperClassName}>
          {imageEl}
        </Link>
      );
    };

    return (
      <section className="relative w-full overflow-hidden">
        <figure className="hidden md:block relative w-full aspect-[1920/800] m-0">
          <DesktopImage />
        </figure>
        <figure className="block md:hidden relative w-full aspect-[480/511] m-0">
          <MobileImage />
        </figure>
      </section>
    );
  }

  if (variant === 'image_content' && (imageUrl || mobileImageUrl)) {
    const desktopSrc = imageUrl ?? mobileImageUrl;
    const desktopImg = image ?? mobileImage;
    const desktopTitle = desktopImg?.title;
    const mobileImg = mobileImage ?? image;
    const mobileTitle = mobileImg?.title;

    return (
      <section className="relative w-full overflow-hidden">
        {/* Desktop: landscape image + content */}
        <div className="relative w-full hidden md:block">
          <div className="relative w-full aspect-[1920/800]">
            <Link
              href={heroImageHref(desktopImg?.link)}
              className="block relative w-full h-full"
            >
              <Image
                src={desktopSrc!}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1920px"
                className="object-cover"
              />
            </Link>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-[1]" />
          <div className="absolute inset-0 z-[2] flex items-center">
            <ContentBlock />
          </div>
          {desktopTitle && (
            <figcaption className="absolute bottom-6 left-0 right-0 z-[2] px-6 text-center text-sm text-white/80 drop-shadow-md">
              {desktopTitle}
            </figcaption>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-[1]" />
        </div>

        {/* Mobile: portrait image + mobile content */}
        <div className="relative w-full block md:hidden">
          <div className="relative w-full aspect-[480/511]">
            <Link
              href={heroImageHref(mobileImg?.link)}
              className="block relative w-full h-full"
            >
              <Image
                src={mobileImageUrl!}
                alt={mobileImageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1920px"
                className="object-cover"
              />
            </Link>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />
          <div className="absolute inset-0 z-[2] flex flex-col justify-end">
            <div className="pb-2 px-4">
              {mobileTitle && (
                <figcaption className="text-center text-sm text-white/80 drop-shadow-md">
                  {mobileTitle}
                </figcaption>
              )}
            </div>
            <div className="pb-8">
              <ContentBlock h={mHeading} d={mDesc} s={mSmall} c={mCta} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'image_content' && !imageUrl && showContent) {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[1]" />
        <div className="relative z-[2] flex items-center">
          <ContentBlock />
        </div>
      </section>
    );
  }

  return null;
}
