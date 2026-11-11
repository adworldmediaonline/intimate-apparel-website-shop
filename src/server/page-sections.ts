'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { API_ENDPOINT } from './api-endpoint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ImageWithMeta {
  url: string;
  fileName: string;
  title: string;
  altText: string;
  /** Optional link to navigate when image is clicked (e.g. /shop, /about) */
  link?: string;
}

export type CustomBlockType = 'text' | 'image' | 'button' | 'spacer' | 'columns' | 'video';

export interface CustomBlockBase {
  id: string;
  type: CustomBlockType;
  /** Optional Tailwind classes applied to the block wrapper (e.g. text-center, flex justify-center) */
  className?: string;
}

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export const HEADING_LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export interface CustomTextBlock extends CustomBlockBase {
  type: 'text';
  heading?: string;
  headingLevel?: HeadingLevel;
  body?: string;
}

export interface CustomImageBlock extends CustomBlockBase {
  type: 'image';
  image?: ImageWithMeta;
}

export interface CustomButtonBlock extends CustomBlockBase {
  type: 'button';
  text: string;
  link: string;
}

export interface CustomSpacerBlock extends CustomBlockBase {
  type: 'spacer';
  height?: number;
}

export interface CustomColumnItem {
  heading?: string;
  headingLevel?: HeadingLevel;
  body?: string;
}

export interface CustomColumnsBlock extends CustomBlockBase {
  type: 'columns';
  columnCount?: 2 | 3 | 4;
  items: CustomColumnItem[];
}

export interface CustomVideoBlock extends CustomBlockBase {
  type: 'video';
  url: string;
  title?: string;
}

export type CustomBlock =
  | CustomTextBlock
  | CustomImageBlock
  | CustomButtonBlock
  | CustomSpacerBlock
  | CustomColumnsBlock
  | CustomVideoBlock;

export interface CustomSectionLayout {
  width?: 'full' | 'contained';
  backgroundColor?: string;
  backgroundImage?: ImageWithMeta;
}

export interface CustomSectionContent {
  layout?: CustomSectionLayout;
  blocks: CustomBlock[];
}

/** Category Showcase section – displays categories from DB with configurable heading/CTA */
export interface CategoryShowcaseContent {
  heading?: string;
  showExploreAll?: boolean;
  exploreAllLink?: string;
  exploreAllLabel?: string;
  /** Optional custom order of category IDs. Categories not in this array appear after, in API order. */
  categoryOrder?: string[];
}

export interface HeroSectionContent {
  variant: 'image_only' | 'image_content' | 'content_only';
  image?: ImageWithMeta;
  heading?: string;
  description?: string;
  smallSubDescription?: string;
  cta?: { text: string; link: string };
  /** Mobile variant – separate image and content optimized for mobile */
  mobileImage?: ImageWithMeta;
  mobileHeading?: string;
  mobileDescription?: string;
  mobileSmallSubDescription?: string;
  mobileCta?: { text: string; link: string };
}

export interface PageSection {
  _id: string;
  pageSlug: string;
  sectionKey: string;
  sectionType: string;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  order: number;
  isActive: boolean;
}

export async function getActivePageSections(
  pageSlug: string
): Promise<PageSection[]> {
  cacheLife('days');
  cacheTag('cms', 'page-sections');
  if (!API_BASE_URL || !pageSlug?.trim()) return [];

  try {
    const normalizedSlug = pageSlug.toLowerCase().trim();
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PAGE_SECTIONS}/page/${normalizedSlug}/active`,
      { next: { revalidate: 3600, tags: ['cms', 'page-sections'] } }
    );

    if (!response.ok) return [];

    const json = await response.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];

    return json.data as PageSection[];
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }
}
