import HeroBanner from './hero-banner';
import CmsHeroSection from './cms-hero-section';
import { getActivePageSections } from '@/server/page-sections';
import type { HeroSectionContent } from '@/server/page-sections';

interface HeroBannerWrapperProps {
  pageSlug?: string;
}

export default async function HeroBannerWrapper({
  pageSlug = 'home',
}: HeroBannerWrapperProps) {
  const sections = await getActivePageSections(pageSlug);
  const heroSection = sections.find((s) => s.sectionType === 'hero') ?? null;

  if (heroSection?.content && Object.keys(heroSection.content).length > 0) {
    const content = heroSection.content as unknown as HeroSectionContent;
    return <CmsHeroSection content={content} />;
  }

  return <HeroBanner />;
}
