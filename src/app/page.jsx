import brand from '@/lib/brand';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import { getPaginatedProductsServer } from '@/server/products';
import { getCategoriesShow } from '@/server/categories';
import { getActiveBanners } from '@/server/banner';
import { getHomeRows } from '@/server/home-rows';

import BrandTheme from '@/components/wireframe/brand-theme';
import WfHero from '@/components/wireframe/wf-hero';
import HeroBanner from '@/components/version-tsx/hero-banner';
import WfRibbon from '@/components/wireframe/wf-ribbon';
import WfSectionHead from '@/components/wireframe/wf-section-head';
import WfCollectionsGrid from '@/components/wireframe/wf-collections-grid';
import WfProductCard from '@/components/wireframe/wf-product-card';
import WfStatStrip from '@/components/wireframe/wf-stat-strip';
import WfReviewsStrip from '@/components/wireframe/wf-reviews-strip';
import WfMediaStrip from '@/components/wireframe/wf-media-strip';

import { safe, toCollectionTiles, toWfProducts } from '@/lib/wf-adapters';
import {
  wfFallbackReviews,
  wfHero,
  wfMediaNames,
  wfRibbon,
  wfStats,
} from '@/lib/wf-content';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('home');
  return buildPageMetadata('home', cmsData, {
    title: brand.seo.title,
    description: brand.seo.description,
    keywords: brand.seo.keywords,
    canonical: '/',
  });
}

/**
 * Reorder so consecutive items come from different categories: the first of
 * each category, then the second of each, and so on. Order within a category
 * is preserved, and a product whose category is missing is grouped under ''
 * rather than dropped.
 */
function spreadAcrossCategories(products) {
  const groups = new Map();
  for (const product of products) {
    const key = product?.category?.name ?? product?.parent ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  const spread = [];
  const queues = [...groups.values()];
  for (let round = 0; spread.length < products.length; round += 1) {
    for (const queue of queues) {
      if (queue[round]) spread.push(queue[round]);
    }
    if (round > products.length) break; // belt and braces against a bad shape
  }
  return spread;
}

export default async function HomePage() {
  // Every fetch is wrapped so an unreachable backend degrades to an empty
  // section rather than a 500 — the editorial layout still renders in full.
  const [products, categories, banners, homeRows] = await Promise.all([
    // Enough of the catalogue to draw from every category. At 12 the page only
    // ever saw the first category or two, which is why New Arrivals came out
    // as four variations of the same thing. `slim` keeps the bigger fetch
    // cheap — the cards here only need the card shape.
    safe(() => getPaginatedProductsServer({ limit: 100, page: 1, slim: true }), null),
    safe(() => getCategoriesShow(), []),
    safe(() => getActiveBanners(), []),
    safe(() => getHomeRows(), {}),
  ]);

  const list = Array.isArray(products) ? products : (products?.data ?? []);
  const catList = Array.isArray(categories) ? categories : (categories?.result ?? categories?.data ?? []);

  /**
   * Hand-picked in Dashboard -> Home Rows, in the order they were dragged.
   * A row nobody has curated falls back to the automatic pick below, so the
   * home page is never empty just because no one has chosen yet.
   */
  const pick = (key, fallback, defaultLimit) => {
    const row = homeRows?.[key];
    if (row?.enabled === false) return [];
    const limit = row?.limit ?? defaultLimit;
    return row?.curated && row.products.length
      ? toWfProducts(row.products, limit)
      : fallback(limit);
  };

  const bestsellers = pick('bestsellers', limit => toWfProducts(list, limit), 12);
  /**
   * One per category, newest first.
   *
   * Products are arranged by category, so taking the last four of the list
   * returned four neighbours — all of them the same category. Walking one
   * category at a time gives the row some range, which is the whole point of
   * a shop-front strip.
   */
  const newArrivals = pick(
    'new-arrivals',
    limit => toWfProducts(spreadAcrossCategories([...list].reverse()), limit),
    8
  );
  // Only the categories the admin has switched on for the home page.
  const tiles = toCollectionTiles(catList, 5, { homeOnly: true });
  const heroImage = bestsellers[0]?.image;
  const bannerList = Array.isArray(banners) ? banners : [];

  return (
    <div className="wf">
      <BrandTheme />

      {/* Banner artwork carries its own headline, CTA and category strip, so it
          replaces the wireframe hero outright rather than sitting behind it.
          WfHero stays as the fallback when no active banner is configured. */}
      {bannerList.length > 0 ? (
        <HeroBanner banners={bannerList} />
      ) : (
        <WfHero
          eyebrow={wfHero.eyebrow}
          title={wfHero.title}
          body={wfHero.body}
          image={heroImage}
          primaryCta={wfHero.primaryCta}
          secondaryCta={wfHero.secondaryCta}
        />
      )}

      <WfRibbon lead={wfRibbon.lead} sub={wfRibbon.sub} />

      {newArrivals.length > 0 && (
        <section className="wf-section">
          <div className="wf-wrap">
            <WfSectionHead
              eyebrow="Fresh in"
              title="New Arrivals"
              linkHref={homeRows?.['new-arrivals']?.curated
                ? '/shop?collection=new-arrivals'
                : '/shop?sort=newest'}
            />
            <div className="wf-product-grid">
              {newArrivals.map(p => (
                <WfProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {bestsellers.length > 0 && (
        <section className="wf-section" style={{ paddingTop: 0 }}>
          <div className="wf-wrap">
            <WfSectionHead
              eyebrow="Loved by customers"
              title="Bestsellers"
              linkHref={homeRows?.bestsellers?.curated
                ? '/shop?collection=bestsellers'
                : '/shop?sort=best-selling'}
              linkLabel="Shop all"
            />
            <div className="wf-product-scroller">
              {bestsellers.map(p => (
                <WfProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {tiles.length > 0 && (
        <section className="wf-section">
          <div className="wf-wrap">
            <WfSectionHead
              eyebrow="Curated edits"
              title="Shop by Collection"
              linkHref="/categories"
              linkLabel="All categories"
            />
            <WfCollectionsGrid tiles={tiles} />
          </div>
        </section>
      )}

      <section className="wf-section">
        <div className="wf-wrap">
          <WfStatStrip stats={wfStats} />
        </div>
      </section>

      {wfFallbackReviews.length > 0 && (
        <section className="wf-section" style={{ paddingTop: 0 }}>
          <div className="wf-wrap">
            <WfSectionHead eyebrow="Kind words" title="Loved & Reviewed" center />
            <WfReviewsStrip reviews={wfFallbackReviews} />
          </div>
        </section>
      )}

      {wfMediaNames.length > 0 && (
        <section className="wf-section" style={{ paddingTop: 0 }}>
          <div className="wf-wrap">
            <WfMediaStrip names={wfMediaNames} />
          </div>
        </section>
      )}
    </div>
  );
}
