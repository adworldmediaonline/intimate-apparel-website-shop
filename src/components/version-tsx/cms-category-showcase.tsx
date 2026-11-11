import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CategoryShowcaseGrid } from './categories/category-showcase-grid';
import type { CategoryShowcaseContent } from '@/server/page-sections';

const DEFAULT_HEADING = 'Shop by Category';
const DEFAULT_EXPLORE_LABEL = 'Explore all';
const DEFAULT_EXPLORE_LINK = '/shop';

interface CmsCategoryShowcaseProps {
  content: CategoryShowcaseContent;
  /** Pre-fetched categories; when provided, skips internal fetch (for parallel loading) */
  categories?: unknown[];
}

export default function CmsCategoryShowcase({ content, categories }: CmsCategoryShowcaseProps) {
  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const showExploreAll = content.showExploreAll ?? true;
  const exploreAllLink = content.exploreAllLink?.trim() || DEFAULT_EXPLORE_LINK;
  const exploreAllLabel = content.exploreAllLabel?.trim() || DEFAULT_EXPLORE_LABEL;

  return (
    <section
      aria-labelledby="category-heading"
      className="w-full py-8 md:py-10"
    >
      <div className="container mx-auto px-3 md:px-6">
        <div className="mb-4 md:mb-6 flex items-end justify-between gap-3">
          <h2
            id="category-heading"
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
          >
            {heading}
          </h2>
          {showExploreAll && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link
                scroll={true}
                href={exploreAllLink}
                aria-label={`${exploreAllLabel} categories`}
              >
                {exploreAllLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <CategoryShowcaseGrid categoryOrder={content.categoryOrder} categories={categories} />
      </div>
    </section>
  );
}
