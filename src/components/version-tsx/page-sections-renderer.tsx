import HeroBanner from './hero-banner';
import CmsHeroSection from './cms-hero-section';
import CmsCustomSection from './cms-custom-section';
import CmsCategoryShowcase from './cms-category-showcase';
import { getActivePageSections } from '@/server/page-sections';
import type {
  HeroSectionContent,
  CustomSectionContent,
  CategoryShowcaseContent,
  PageSection,
} from '@/server/page-sections';

interface PageSectionsRendererProps {
  pageSlug?: string;
  /** Pre-fetched sections; when provided, skips internal fetch (for parallel loading) */
  sections?: PageSection[];
  /** Pre-fetched banners for HeroBanner (when no CMS hero content) */
  banners?: unknown[];
  /** Pre-fetched categories for CategoryShowcase */
  categories?: unknown[];
}

export default async function PageSectionsRenderer({
  pageSlug = 'home',
  sections: sectionsProp,
  banners: bannersProp,
  categories: categoriesProp,
}: PageSectionsRendererProps) {
  const sections = sectionsProp ?? (await getActivePageSections(pageSlug));
  const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const hasCategoryShowcase = sortedSections.some(
    (s) => s.sectionType === 'category_showcase'
  );

  return (
    <>
      {sortedSections.map((section) => {
        if (section.sectionType === 'hero') {
          if (section.content && Object.keys(section.content).length > 0) {
            return (
              <CmsHeroSection
                key={section._id}
                content={section.content as unknown as HeroSectionContent}
              />
            );
          }
          return <HeroBanner key={section._id} banners={bannersProp} />;
        }

        if (section.sectionType === 'category_showcase') {
          return (
            <CmsCategoryShowcase
              key={section._id}
              content={(section.content ?? {}) as unknown as CategoryShowcaseContent}
              categories={categoriesProp}
            />
          );
        }

        if (section.sectionType === 'custom') {
          const content = (section.content ?? { blocks: [] }) as unknown as CustomSectionContent;
          if (!content.blocks?.length) return null;
          return (
            <CmsCustomSection
              key={section._id}
              content={content}
            />
          );
        }

        return null;
      })}

      {!hasCategoryShowcase && pageSlug === 'home' ? (
        <CmsCategoryShowcase
          content={{
            heading: 'Shop by Category',
            showExploreAll: true,
            exploreAllLink: '/shop',
            exploreAllLabel: 'Explore all',
          }}
          categories={categoriesProp}
        />
      ) : null}
    </>
  );
}
