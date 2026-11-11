import type { PageMetadata } from '@/server/page-metadata';

const DEFAULT_METADATA_BASE = new URL('https://unwrapher.com');

export interface PageMetadataDefaults {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

/**
 * Build Next.js metadata object from CMS page metadata with fallbacks.
 */
export function buildPageMetadata(
  slug: string,
  cmsData: PageMetadata | null,
  defaults: PageMetadataDefaults
) {
  const base = {
    metadataBase: DEFAULT_METADATA_BASE,
    alternates: {
      canonical: defaults.canonical ?? `/${slug}`,
    },
  };

  if (cmsData?.isActive !== false && (cmsData?.metaTitle || cmsData?.metaDescription)) {
    return {
      ...base,
      title: cmsData.metaTitle ?? defaults.title,
      description: cmsData.metaDescription ?? defaults.description ?? '',
      keywords: cmsData.metaKeywords ?? defaults.keywords ?? '',
      alternates: {
        canonical: cmsData.canonicalUrl ?? defaults.canonical ?? `/${slug}`,
      },
      openGraph: cmsData.ogImage
        ? {
          images: [{ url: cmsData.ogImage }],
        }
        : undefined,
    };
  }

  return {
    ...base,
    title: defaults.title,
    description: defaults.description ?? '',
    keywords: defaults.keywords ?? '',
    alternates: {
      canonical: defaults.canonical ?? `/${slug}`,
    },
  };
}
