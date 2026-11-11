import BrandTheme from '@/components/wireframe/brand-theme';
import WfSectionHead from '@/components/wireframe/wf-section-head';
import { BRAND_NAME } from '@/lib/brand';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';
import { safe, toCollectionTiles } from '@/lib/wf-adapters';
import { getCategoriesShow } from '@/server/categories';
import { getPageMetadata } from '@/server/page-metadata';
import Link from 'next/link';

/**
 * Every category in one place.
 *
 * The home page shows the first few collections and links here for the rest.
 * Which categories appear, and in what order, is the same decision as
 * everywhere else on the site — the admin's Show/Hide switch, then
 * `commerce.categoryOrder` — so this page needs no list of its own.
 */
export async function generateMetadata() {
  const cmsData = await getPageMetadata('categories');
  return buildPageMetadata('categories', cmsData, {
    title: `Shop by Category - ${BRAND_NAME}`,
    description: `Browse every collection at ${BRAND_NAME}: bridal and honeymoon, role play, baby doll, lace and body stocking, body suits, lingerie and night suits.`,
    canonical: '/categories',
  });
}

export default async function CategoriesPage() {
  const categories = await safe(() => getCategoriesShow(), []);
  const list = Array.isArray(categories)
    ? categories
    : ((categories as { result?: unknown[] })?.result ?? []);

  // No limit: this is the page that shows all of them.
  const tiles = toCollectionTiles(list, Number.POSITIVE_INFINITY);

  return (
    <div className="wf">
      <BrandTheme />
      <section className="wf-section">
        <div className="wf-wrap">
          <WfSectionHead
            eyebrow="Browse"
            title="Shop by Category"
            linkHref="/shop"
            // "Shop all products" is wide enough to wrap the heading onto two
            // lines on a phone now that the link sits beside it.
            linkLabel="Shop all"
          />

          {tiles.length === 0 ? (
            <p className="wf-muted">No categories are available right now.</p>
          ) : (
            <div className="wf-category-grid">
              {tiles.map(tile => (
                <Link href={tile.href} key={tile.title} className="wf-col-tile">
                  <span className="bg">
                    {tile.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cloudinaryVariant(tile.image, 400)}
                        srcSet={cloudinarySrcSet(tile.image, 400)}
                        sizes="(max-width: 700px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </span>
                  <span className="cap">
                    {tile.caption && <small>{tile.caption}</small>}
                    <span className="h">{tile.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
