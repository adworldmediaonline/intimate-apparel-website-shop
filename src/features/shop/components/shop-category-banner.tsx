'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { isCloudinaryUrl } from '@/lib/product-image';
import { CategoryItem, toSlug, type BannerDisplayScope } from '@/lib/server-data';

export interface ShopCategoryBannerContext {
  banner: { url: string; fileName?: string; altText?: string; title?: string };
  showBannerImage: boolean;
  showBannerContent: boolean;
  bannerCategoryName: string;
  bannerProductCountText: string;
  bannerDescription: string;
  bannerTitleClasses: string;
  bannerDescriptionClasses: string;
  bannerHeadingTag: 'h1' | 'h2' | 'h3';
  bannerProductCountClasses: string;
}

interface ShopCategoryBannerProps {
  context: ShopCategoryBannerContext | null;
}

export function ShopCategoryBanner({ context }: ShopCategoryBannerProps) {
  if (!context) return null;

  const {
    banner,
    showBannerImage,
    showBannerContent,
    bannerCategoryName,
    bannerProductCountText,
    bannerDescription,
    bannerTitleClasses,
    bannerDescriptionClasses,
    bannerHeadingTag,
    bannerProductCountClasses,
  } = context;

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-0">
      {showBannerContent && bannerCategoryName && (
        <div className="container mx-auto px-3 py-4 md:px-6">
          {(() => {
            const HeadingTag = bannerHeadingTag;
            return (
              <HeadingTag
                className={cn(
                  'text-xl sm:text-2xl md:text-3xl font-bold text-foreground',
                  bannerTitleClasses
                )}
              >
                {bannerCategoryName}
                {bannerProductCountText && (
                  <span
                    className={cn(
                      'ml-1.5 font-normal text-muted-foreground text-sm sm:text-base',
                      bannerProductCountClasses
                    )}
                  >
                    {bannerProductCountText}
                  </span>
                )}
              </HeadingTag>
            );
          })()}
        </div>
      )}
      {showBannerImage && banner?.url && (
        <div className="w-full flex items-center justify-center">
          <div className="relative w-full mx-auto">
            <Image
              src={
                isCloudinaryUrl(banner.url)
                  ? banner.url
                  : `/api/image?url=${encodeURIComponent(banner.url)}&filename=${encodeURIComponent(banner.fileName || 'category-banner.webp')}`
              }
              alt={banner.altText || banner.title || 'Category banner'}
              width={1920}
              height={800}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 1920px"
              unoptimized={!isCloudinaryUrl(banner.url)}
              priority={false}
            />
          </div>
        </div>
      )}
      {showBannerContent && bannerDescription && (
        <div className="container mx-auto px-3 py-4 md:px-6">
          <p
            className={cn(
              'text-sm sm:text-base text-muted-foreground leading-relaxed',
              bannerDescriptionClasses
            )}
          >
            {bannerDescription}
          </p>
        </div>
      )}
    </div>
  );
}

/** Resolve banner context from category, filters, and product count. */
export function resolveCategoryBannerContext(
  categories: CategoryItem[],
  categorySlug: string,
  subcategorySlug: string,
  totalProducts: number
): ShopCategoryBannerContext | null {
  if (!categorySlug || !categories.length) return null;

  const category = categories.find((c) => toSlug(c.parent) === categorySlug);
  if (!category) return null;

  const subcategorySlugs = subcategorySlug
    ? subcategorySlug.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const isParentView = subcategorySlugs.length === 0;

  const imageScope: BannerDisplayScope = category.bannerDisplayScope || 'all';
  const imageDisplayChildren = category.bannerDisplayChildren || [];
  const isImageChildInScope =
    subcategorySlugs.length > 0 &&
    subcategorySlugs.some((slug) => imageDisplayChildren.includes(slug));

  let showBannerImage = false;
  if (category.banner?.url) {
    switch (imageScope) {
      case 'all':
        showBannerImage = true;
        break;
      case 'parent_only':
        showBannerImage = isParentView;
        break;
      case 'children_only':
        showBannerImage = !!isImageChildInScope;
        break;
      case 'parent_and_children':
        showBannerImage = isParentView || !!isImageChildInScope;
        break;
      default:
        showBannerImage = true;
    }
  }

  const contentScope: BannerDisplayScope =
    category.bannerContentDisplayScope || 'all';
  const contentDisplayChildren = category.bannerContentDisplayChildren || [];
  const isContentChildInScope =
    subcategorySlugs.length > 0 &&
    subcategorySlugs.some((slug) => contentDisplayChildren.includes(slug));

  let showBannerContent = false;
  if (category.bannerContentActive) {
    switch (contentScope) {
      case 'all':
        showBannerContent = true;
        break;
      case 'parent_only':
        showBannerContent = isParentView;
        break;
      case 'children_only':
        showBannerContent = !!isContentChildInScope;
        break;
      case 'parent_and_children':
        showBannerContent = isParentView || !!isContentChildInScope;
        break;
      default:
        showBannerContent = true;
    }
  }

  if (!showBannerImage && !showBannerContent) return null;

  const productCount = totalProducts;
  const productLabel = productCount === 1 ? 'product' : 'products';
  const productCountText = ` (${productCount} ${productLabel})`;

  const categoryName = isParentView
    ? category.parent
    : subcategorySlugs
        .map((slug) =>
          category.children?.find((c) => toSlug(c) === slug) || slug
        )
        .join(', ');

  const defaultTitleClasses = 'text-center';
  const defaultDescClasses = 'text-center';
  const legacyTitleClasses =
    category.bannerTitleClasses?.trim() || defaultTitleClasses;
  const legacyDescClasses =
    category.bannerDescriptionClasses?.trim() || defaultDescClasses;

  const scopeClasses = category.bannerContentClassesByScope;
  const parentScope = scopeClasses?.parent;
  const childrenScope = scopeClasses?.children ?? {};

  let bannerTitleClasses: string;
  let bannerDescriptionClasses: string;
  let bannerHeadingTag: 'h1' | 'h2' | 'h3';
  let bannerProductCountClasses: string;

  if (isParentView) {
    bannerTitleClasses = parentScope?.titleClasses?.trim() || legacyTitleClasses;
    bannerDescriptionClasses =
      parentScope?.descriptionClasses?.trim() || legacyDescClasses;
    bannerHeadingTag = parentScope?.headingTag || 'h2';
    bannerProductCountClasses = parentScope?.productCountClasses?.trim() || '';
  } else {
    const childScope = subcategorySlugs
      .map((slug) => childrenScope[slug])
      .find(Boolean);
    bannerTitleClasses =
      childScope?.titleClasses?.trim() ||
      parentScope?.titleClasses?.trim() ||
      legacyTitleClasses;
    bannerDescriptionClasses =
      childScope?.descriptionClasses?.trim() ||
      parentScope?.descriptionClasses?.trim() ||
      legacyDescClasses;
    bannerHeadingTag =
      childScope?.headingTag || parentScope?.headingTag || 'h2';
    bannerProductCountClasses =
      childScope?.productCountClasses?.trim() ||
      parentScope?.productCountClasses?.trim() ||
      '';
  }

  return {
    banner: category.banner!,
    showBannerImage,
    showBannerContent,
    bannerCategoryName: showBannerContent ? categoryName : '',
    bannerProductCountText: showBannerContent ? productCountText : '',
    bannerDescription: category.bannerDescription || '',
    bannerTitleClasses: bannerTitleClasses || defaultTitleClasses,
    bannerDescriptionClasses: bannerDescriptionClasses || defaultDescClasses,
    bannerHeadingTag,
    bannerProductCountClasses,
  };
}
