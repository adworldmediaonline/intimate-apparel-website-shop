'use client';
import {
  getProductImageAlt,
  getProductImageTitle,
  getVariantImageAlt,
  getVariantImageTitle,
} from '@/lib/product-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CloudinaryImage from '../../common/CloudinaryImage';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import './photoswipe-overrides.css';

/**
 * Resolve each image's REAL intrinsic size.
 *
 * PhotoSwipe computes its fit-to-viewport scale and centring transform from the
 * width/height handed to each <Item>. Passing a fixed square (the old behaviour)
 * makes it lay out a box that doesn't match the actual image, so the picture ends up
 * mis-scaled and visibly off-centre. Measuring the natural size fixes both.
 *
 * Falls back to the caller's defaults until a given image has loaded.
 */
const useImageNaturalSizes = urls => {
  const [sizes, setSizes] = useState({});
  // Depend on a stable string key: `urls` is a fresh array every render, so using it
  // directly as a dependency would re-run this effect (and re-create Image objects)
  // on every single render.
  const key = (urls || []).filter(Boolean).join('|');

  useEffect(() => {
    let cancelled = false;
    const pending = key ? key.split('|') : [];

    pending.forEach(url => {
      const img = new window.Image();
      img.onload = () => {
        if (cancelled || !img.naturalWidth || !img.naturalHeight) return;
        setSizes(prev =>
          prev[url]
            ? prev
            : { ...prev, [url]: { width: img.naturalWidth, height: img.naturalHeight } }
        );
      };
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return sizes;
};

/** True on devices with a precise pointer (mouse) — gates the hover magnifier. */
const useHasFinePointer = () => {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return fine;
};

// Component that uses the gallery hook
const GalleryContent = ({
  activeImg,
  handleImageActive,
  imageURLs = [],
  productItem,
  imgWidth = 580,
  imgHeight = 580,
  outOfStock = false,
}) => {
  const product = productItem || { title: '' };
  const mainAlt = getProductImageAlt(product);
  const mainTitle = getProductImageTitle(product);
  const thumbnailsRef = useRef(null);
  const verticalThumbnailsRef = useRef(null);

  // Prepare images for react-photoswipe-gallery
  const allImages = [
    activeImg,
    ...(imageURLs?.filter(url => url !== activeImg) || []),
  ];

  // Real intrinsic sizes so PhotoSwipe scales/centres correctly (see hook docs).
  const naturalSizes = useImageNaturalSizes(allImages);
  const sizeFor = url => ({
    width: naturalSizes[url]?.width ?? imgWidth,
    height: naturalSizes[url]?.height ?? imgHeight,
  });

  // Desktop hover magnifier on the main image.
  const hasFinePointer = useHasFinePointer();
  const [zoomOrigin, setZoomOrigin] = useState(null); // {x,y} in %

  const handleZoomMove = e => {
    if (!hasFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  // Handle horizontal thumbnail scroll - 64px on mobile, 80px on desktop
  const scrollThumbnails = direction => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const thumbnailWidth = 64; // Mobile thumbnails are w-16 (64px)
      const scrollAmount =
        direction === 'left' ? -thumbnailWidth : thumbnailWidth;
      const currentScroll = container.scrollLeft;

      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Handle vertical thumbnail scroll
  const scrollVerticalThumbnails = direction => {
    if (verticalThumbnailsRef.current) {
      const container = verticalThumbnailsRef.current;
      const thumbnailHeight = 80 + 12; // 80px height + 12px gap (gap-3)
      const scrollAmount =
        direction === 'up' ? -thumbnailHeight : thumbnailHeight;
      const currentScroll = container.scrollTop;

      container.scrollTo({
        top: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Check if vertical thumbnails can scroll
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      const container = verticalThumbnailsRef.current;
      if (container) {
        setCanScrollUp(container.scrollTop > 0);
        setCanScrollDown(
          container.scrollTop < container.scrollHeight - container.clientHeight - 1
        );
      }
    };

    const container = verticalThumbnailsRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);

      // Also check when images change
      const resizeObserver = new ResizeObserver(checkScrollPosition);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        resizeObserver.disconnect();
      };
    }
  }, [imageURLs, activeImg]);

  // Scroll to active thumbnail when it changes
  useEffect(() => {
    // For horizontal thumbnails (mobile/tablet)
    if (thumbnailsRef?.current) {
      const activeThumb = thumbnailsRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeThumb) {
        const container = thumbnailsRef.current;
        const scrollLeft =
          activeThumb.offsetLeft -
          container.offsetWidth / 2 +
          activeThumb.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }

    // For vertical thumbnails (desktop only)
    if (verticalThumbnailsRef.current) {
      const activeThumb = verticalThumbnailsRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeThumb) {
        const container = verticalThumbnailsRef.current;
        const scrollTop =
          activeThumb.offsetTop -
          container.offsetHeight / 2 +
          activeThumb.offsetWidth / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeImg]);

  return (
    <div className="space-y-6">
      {/* Main image and vertical thumbnails (Desktop only) */}
      <div className="flex gap-4 items-start">
        {/* Vertical thumbnails for desktop only */}
        {imageURLs && imageURLs.length > 0 && (
          <div className="hidden lg:flex flex-col items-center gap-2 relative">
            {/* Up arrow button */}
            {imageURLs.length > 5 && canScrollUp && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-20 p-0 rounded-md bg-background/95 backdrop-blur-sm border-border shadow-sm hover:bg-background z-10"
                onClick={() => scrollVerticalThumbnails('up')}
                aria-label="Scroll thumbnails up"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}

            {/* Thumbnail container */}
            <div
              className="flex flex-col gap-3 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-hide"
              ref={verticalThumbnailsRef}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {imageURLs.map((url, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className={`w-20 h-20 p-1 rounded-lg border-2 transition-all hover:border-primary focus:border-primary shrink-0 ${activeImg === url
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => handleImageActive(url)}
                  aria-label={`View product image ${i + 1}`}
                  data-active={activeImg === url}
                >
                  <CloudinaryImage
                    src={url ?? null}
                    alt={getVariantImageAlt(product, i, url)}
                    title={getVariantImageTitle(product, i)}
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-md"
                    crop="pad"
                    gravity="center"
                    preserveTransformations={false}
                  />
                </Button>
              ))}
            </div>

            {/* Down arrow button */}
            {imageURLs.length > 5 && canScrollDown && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-20 p-0 rounded-md bg-background/95 backdrop-blur-sm border-border shadow-sm hover:bg-background z-10"
                onClick={() => scrollVerticalThumbnails('down')}
                aria-label="Scroll thumbnails down"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Main image container */}
        <div className="flex-1 min-h-0">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group max-h-[500px]">
                {/* Main image display - clickable to open gallery */}
                <Item
                  original={activeImg}
                  thumbnail={activeImg}
                  width={sizeFor(activeImg).width}
                  height={sizeFor(activeImg).height}
                  alt={mainAlt}
                >
                  {({ ref, open }) => (
                    <div
                      ref={ref}
                      className="cursor-zoom-in relative h-full overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-lg"
                      onClick={open}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          open(e);
                        }
                      }}
                      onMouseMove={handleZoomMove}
                      onMouseLeave={() => setZoomOrigin(null)}
                      aria-label="Click to open image lightbox"
                    >
                      {/* Image container - no forced aspect ratio */}
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
                        <CloudinaryImage
                          src={activeImg}
                          alt={mainAlt}
                          title={mainTitle || undefined}
                          width={imgWidth}
                          height={imgHeight}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, min(580px, 50vw)"
                          className={`max-w-full max-h-[500px] w-auto h-auto object-contain transition-opacity duration-200 ${
                            zoomOrigin ? 'opacity-0' : 'opacity-100'
                          }`}
                          priority={true}
                          fetchPriority="high"
                          crop="pad"
                          gravity="center"
                          preserveTransformations={false}
                        />
                      </div>

                      {/*
                        Desktop hover magnifier: a zoomed copy of the image tracking the
                        cursor. pointer-events-none so the click still opens the lightbox.
                      */}
                      {zoomOrigin && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gray-50 bg-no-repeat transition-opacity duration-200"
                          style={{
                            // Quoted: proxy srcs (/api/image?url=...&filename=...) contain
                            // characters that break an unquoted CSS url().
                            backgroundImage: `url("${activeImg}")`,
                            backgroundSize: '200%',
                            backgroundPosition: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                          }}
                        />
                      )}

                      {/* Zoom affordance */}
                      <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:opacity-100">
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {zoomOrigin ? 'Click to expand' : 'Hover to zoom'}
                        </span>
                      </div>
                    </div>
                  )}
                </Item>

                {/* Out of stock badge */}
                {outOfStock && (
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="destructive"
                      className="text-sm font-medium px-3 py-1"
                    >
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced click to zoom hint */}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>
              Click to zoom • Pinch/scroll to zoom • Double-tap to zoom
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal thumbnails (Mobile & Tablet only - hidden on desktop) */}
      {imageURLs && imageURLs.length > 0 && (
        <div className="lg:hidden relative">
          {imageURLs.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-background"
              onClick={() => scrollThumbnails('left')}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide px-2"
            ref={thumbnailsRef}
          >
            {imageURLs.map((url, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className={`w-16 h-16 p-1 rounded-lg border-2 transition-all hover:border-primary focus:border-primary shrink-0 ${activeImg === url
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleImageActive(url)}
                aria-label={`View product image ${i + 1}`}
                data-active={activeImg === url}
              >
                <CloudinaryImage
                  src={url ?? null}
                  alt={getVariantImageAlt(product, i, url)}
                  title={getVariantImageTitle(product, i)}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-cover rounded-md"
                  crop="pad"
                  gravity="center"
                  preserveTransformations={false}
                />
              </Button>
            ))}
          </div>

          {imageURLs.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-background"
              onClick={() => scrollThumbnails('right')}
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Additional gallery items for remaining images */}
      {imageURLs
        .filter(url => url !== activeImg)
        .map((url, i) => (
          <Item
            key={`gallery-${i + 1}`}
            original={url}
            thumbnail={url}
            width={sizeFor(url).width}
            height={sizeFor(url).height}
            alt={getVariantImageAlt(product, imageURLs.indexOf(url), url)}
          >
            {({ ref, open }) => (
              <div
                ref={ref}
                onClick={open}
                style={{
                  display: 'none',
                }}
              />
            )}
          </Item>
        ))}
    </div>
  );
};

/**
 * Animated dot indicator for the lightbox, on desktop and mobile.
 *
 * Registered through react-photoswipe-gallery's `uiElements` prop. We build the dots
 * in `onInit` and keep the active one in sync via PhotoSwipe's `change` event; the
 * expand-to-pill animation itself is CSS (see `.pswp-dot` in photoswipe-overrides.css).
 */
const dotsIndicatorUIElement = {
  name: 'dots-indicator',
  className: 'pswp-dots',
  appendTo: 'wrapper',
  // Above PhotoSwipe's own wrapper elements (arrowPrev/arrowNext both use order 10)
  // so insertion order is deterministic.
  order: 20,
  onInit: (el, pswp) => {
    let dots = [];

    const build = () => {
      const total = pswp.getNumItems();
      el.innerHTML = '';
      dots = [];

      // A single-image gallery doesn't need an indicator.
      if (total <= 1) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';

      for (let i = 0; i < total; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'pswp-dot';
        dot.setAttribute('aria-label', `Go to image ${i + 1} of ${total}`);
        dot.onclick = () => pswp.goTo(i);
        el.appendChild(dot);
        dots.push(dot);
      }
      sync();
    };

    const sync = () => {
      dots.forEach((dot, i) => {
        const isActive = i === pswp.currIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    build();
    pswp.on('change', sync);
  },
};

export default function DetailsThumbWrapper({
  activeImg,
  handleImageActive,
  imageURLs = [],
  productItem,
  imgWidth = 580,
  imgHeight = 580,
  outOfStock = false,
}) {
  return (
    <Gallery
      uiElements={[dotsIndicatorUIElement]}
      options={{
        arrowPrev: true,
        arrowNext: true,
        zoom: true,
        close: true,
        counter: true,
        // Near-opaque so the page's coloured header doesn't tint the light backdrop
        // (the previous translucent black read as muddy brown over the gradient).
        bgOpacity: 0.97,
        // Breathing room around the image. This replaces the old CSS max-width/height
        // override on .pswp__img, which broke PhotoSwipe's centring math (image
        // appeared shifted left on mobile).
        padding: { top: 24, bottom: 24, left: 16, right: 16 },
        // Smoother open/close + pinch behaviour
        showHideAnimationType: 'zoom',
        bgClickAction: 'close',
        tapAction: 'toggle-controls',
        doubleTapAction: 'zoom',
        wheelToZoom: true,
        pinchToClose: true,
      }}
    >
      <GalleryContent
        activeImg={activeImg}
        handleImageActive={handleImageActive}
        imageURLs={imageURLs}
        productItem={productItem}
        imgWidth={imgWidth}
        imgHeight={imgHeight}
        outOfStock={outOfStock}
      />
    </Gallery>
  );
}
