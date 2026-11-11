'use client';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/lib/server-data';
import { isCloudinaryUrl } from '@/lib/product-image';
import Link from 'next/link';
import Image from 'next/image';

export interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  /** Image with metadata (fileName, title, altText) */
  image?: { url: string; fileName?: string; title?: string; altText?: string };
  status?: string;
  products?: unknown[];
  children?: string[];
  /** Parent category slug – for subcategory/grouped cards */
  parentCategorySlug?: string;
  /** Comma-separated subcategory slugs – for shop link (single or grouped) */
  subcategorySlug?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface CategoryCardProps {
  item: CategoryItem;
  index?: number;
  /** "mega" for compact layout in header dropdown; "showcase" for homepage */
  variant?: 'mega' | 'showcase';
  /** Called when subcategory tag is clicked (e.g. to close mobile sheet) */
  onNavigate?: () => void;
}
export const CategoryCard = ({
  item,
  index = 0,
  variant = 'showcase',
  onNavigate,
}: CategoryCardProps) => {
  const router = useRouter();
  const imageUrl = item.image?.url || item.img;
  const imageAlt = item.image?.altText || item.image?.title || item.parent;
  const imageTitle = item.image?.title || item.parent;
  const imageFileName = item.image?.fileName;
  const hasImage = Boolean(imageUrl);
  // Use direct Cloudinary URL when possible to avoid proxy bottleneck
  const imageSrc =
    imageUrl && isCloudinaryUrl(imageUrl)
      ? imageUrl
      : hasImage
        ? `/api/image?url=${encodeURIComponent(imageUrl as string)}&filename=${encodeURIComponent(imageFileName || `${toSlug(item.parent)}.webp`)}`
        : '';
  const childLabels = Array.isArray(item.children)
    ? item.children.slice(0, 3)
    : [];

  const handleSubcategoryClick = (
    e: React.MouseEvent,
    parent: string,
    child: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const parentSlug = item.parentCategorySlug ?? toSlug(parent);
    const childSlug = toSlug(child);
    router.push(`/shop?category=${parentSlug}&subcategory=${childSlug}`);
    onNavigate?.();
  };

  // Subcategory/grouped card: use parent+subcategory URL (subcategorySlug can be comma-separated for grouped)
  const hasSubcategoryLink = item.parentCategorySlug && item.subcategorySlug;
  const href = hasSubcategoryLink
    ? `/shop?category=${item.parentCategorySlug}&subcategory=${item.subcategorySlug}`
    : `/shop?category=${toSlug(item.parent)}`;

  const isMega = variant === 'mega';

  const handlePrefetch = () => {
    router.prefetch(href);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-full">
      {/* Main category link - covers the image and title area */}
      <div></div>
      <Link
        href={href}
        prefetch={true}
        onMouseEnter={handlePrefetch}
        className="flex-1 flex flex-col"
        aria-label={`Browse ${item.parent}`}
      >
        {/* Image section */}
        <div
          className={`relative w-full shrink-0 ${
            isMega
              ? 'h-24 sm:h-28 md:h-32 lg:h-36'
              : 'h-32 sm:h-40 md:h-48 lg:h-56'
          }`}
        >
          {hasImage ? (
            <div className="relative h-full w-full p-1.5 sm:p-2">
              <Image
                src={imageSrc}
                alt={imageAlt}
                title={imageTitle}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-contain"
                loading={index < 4 ? 'eager' : 'lazy'}
                priority={index < 4}
                unoptimized={!isCloudinaryUrl(imageUrl as string)}
              />
            </div>
          ) : (
            <div className="h-full w-full bg-linear-to-br from-muted to-muted/60" />
          )}
        </div>

        {/* Unified text section with dark background - covers entire remaining area */}
        <div
          className={`bg-linear-to-t from-black/80 via-black/60 to-transparent text-center flex flex-col justify-end flex-1 ${
            isMega
              ? 'px-2 sm:px-3 py-2 sm:py-2.5'
              : 'px-2 sm:px-4 md:px-5 py-2.5 sm:py-4 md:py-5'
          }`}
        >
          <h3
            className={`text-white font-semibold tracking-tight line-clamp-2 ${
              isMega
                ? 'text-xs sm:text-sm mb-1 sm:mb-2'
                : 'text-sm sm:text-lg md:text-xl mb-2 sm:mb-3'
            }`}
          >
            {item.parent}
          </h3>

          {/* Subcategory tags integrated within the same dark background */}
          {childLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
              {childLabels.map(child => {
                const parentSlug = item.parentCategorySlug ?? toSlug(item.parent);
                const childSlug = toSlug(child);
                const subcategoryHref = `/shop?category=${parentSlug}&subcategory=${childSlug}`;
                return (
                  <span
                    key={child}
                    onClick={e => handleSubcategoryClick(e, item.parent, child)}
                    onMouseEnter={() => router.prefetch(subcategoryHref)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSubcategoryClick(e as any, item.parent, child);
                      }
                    }}
                    className={`inline-flex cursor-pointer items-center rounded-full bg-white/90 px-2 py-0.5 font-medium text-foreground hover:bg-white ${
                      isMega ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
                    }`}
                  >
                    {child}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
