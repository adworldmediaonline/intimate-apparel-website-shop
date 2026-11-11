import CmsCategoryShowcase from './cms-category-showcase';

const DEFAULT_CONTENT = {
  heading: 'Shop by Category',
  showExploreAll: true,
  exploreAllLink: '/shop',
  exploreAllLabel: 'Explore all',
};

/**
 * Standalone Category Showcase – used when not managed via CMS.
 * Re-exports the same UI as CmsCategoryShowcase with default config.
 */
export default function CategoryShowcase() {
  return <CmsCategoryShowcase content={DEFAULT_CONTENT} />;
}
