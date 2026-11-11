import { notFound, permanentRedirect } from 'next/navigation';
import brand, { BRAND_NAME, CURRENCY, SITE_URL } from '@/lib/brand';
import ProductDetailsContent from '@/components/version-tsx/product-details/product-details-content';
import RelatedProductsServer from '@/components/version-tsx/product-details/related-products-server';
import { RelatedProductsSkeleton } from '@/components/version-tsx/product-details/related-products-skeleton';
import { ProductContentSkeleton } from '@/components/version-tsx/product-details/product-content-skeleton';
import { BreadcrumbShell } from '@/components/version-tsx/product-details/breadcrumb-shell';
import { BreadcrumbDynamicContent } from '@/components/version-tsx/product-details/breadcrumb-dynamic-content';
import parentCategoryModified from '@/lib/parentCategory';
import {
  getProductImageUrlsForSchema,
  type ProductWithImageMeta,
} from '@/lib/product-image';
import { isOutOfStock } from '@/lib/product-stock';
import { defaultVariantImages } from '@/lib/product-variants';
import { sortByCategoryOrder } from '@/lib/category-order';
import { getCategories } from '@/lib/server-data';
import { getProductForSchema } from '@/server/products';
import {
  getProductSitemapPage,
  PRODUCT_SITEMAP_PAGE_SIZE,
} from '@/server/sitemap-data';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import BrandTheme from '@/components/wireframe/brand-theme';
import WfPdpGallery from '@/components/wireframe/wf-pdp-gallery';
import { VariantMediaProvider } from '@/components/wireframe/wf-variant-media';
import WfPdpAccordions from '@/components/wireframe/wf-pdp-accordions';
import WfPdpBuyBox from '@/components/wireframe/wf-pdp-buybox';
import WfOtherProducts from '@/components/wireframe/wf-other-products';
import WfReviews from '@/components/wireframe/wf-reviews';
import WfSectionHead from '@/components/wireframe/wf-section-head';
import WfStars from '@/components/wireframe/wf-stars';
import { getPaginatedProductsServer, getRelatedProducts } from '@/server/products';
import { safe, toWfProducts } from '@/lib/wf-adapters';
import { wfAssurances } from '@/lib/wf-content';



/**
 * Prerender every product page at build time.
 *
 * This is REQUIRED for SEO: a dynamic `/product/[id]` route under PPR otherwise serves
 * a generic static shell (no real product), so the per-product metadata (og:image/title)
 * and Product JSON-LD only exist in the streamed/JS portion — invisible to view-source /
 * Schema.org validator / non-JS crawlers. Prerendering bakes them into the static HTML.
 *
 * Under `cacheComponents`, caching/revalidation is controlled by `'use cache'` +
 * `cacheLife('hours')` in `getProductForSchema` (not route segment configs, which
 * cacheComponents rejects). Products not in this list still render on demand, and the
 * `product-schema` cache tag lets admin edits force an immediate refresh.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  let slugs: string[] = [];
  try {
    const { data } = await getProductSitemapPage(1, PRODUCT_SITEMAP_PAGE_SIZE);
    slugs = data
      .map((product) => product.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch (error) {
    console.error('generateStaticParams (product) failed:', error);
  }

  // cacheComponents requires generateStaticParams to return at least one result.
  // If the API returns nothing (e.g. unreachable during a local build), fall back to a
  // single known slug so the build still validates; real products are prerendered on
  // Vercel where the API is reachable, and unknown slugs render on demand.
  if (slugs.length === 0) {
    return [{ id: 'placeholder-product' }];
  }

  return slugs.map((slug) => ({ id: slug }));
}

const toAbsoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

const toProductLdScriptDomId = (slugOrId: string): string => {
  const base = slugOrId
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `product-schema-${base || 'item'}`;
};

/**
 * Build the schema.org/Product JSON-LD object from a raw product.
 * Pure function (no request/dynamic APIs) so it can run inside the cached schema
 * path and be prerendered into the static HTML shell.
 */
const buildProductSchema = (
  product: Record<string, unknown>
): Record<string, unknown> => {
  const slug = (product as { slug?: string }).slug || (product._id as string);
  const productUrl = `${SITE_URL}/product/${slug}`;

  const productForImages: ProductWithImageMeta = {
    title: (product as { title?: string }).title ?? '',
    img: (product as { img?: string }).img,
    image: (product as { image?: ProductWithImageMeta['image'] }).image,
    imageURLs: (product as { imageURLs?: string[] }).imageURLs,
    imageURLsWithMeta: (product as {
      imageURLsWithMeta?: ProductWithImageMeta['imageURLsWithMeta'];
    }).imageURLsWithMeta,
  };

  const imageSrcs = getProductImageUrlsForSchema(productForImages, toAbsoluteUrl);

  const description = (product as { description?: string }).description
    ? String((product as { description?: string }).description)
        .replace(/<[^>]*>/g, '')
        .trim()
    : '';

  const price =
    (product as { finalPriceDiscount?: number }).finalPriceDiscount ??
    (product as { displayPrice?: number }).displayPrice ??
    (product as { price?: number }).price ??
    0;

  const reviews =
    (
      product as {
        reviews?: Array<{
          rating?: number;
          comment?: string;
          createdAt?: string;
          userId?: { name?: string };
          guestName?: string;
        }>;
      }
    ).reviews ?? [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewCount
      : 0;

  const schemaReviews = reviews.map((r) => {
    const authorName =
      (r.userId && typeof r.userId === 'object' && 'name' in r.userId
        ? (r.userId as { name?: string }).name
        : null) ??
      r.guestName ??
      'Customer';
    const datePublished = r.createdAt
      ? new Date(r.createdAt).toISOString().slice(0, 10)
      : undefined;
    return {
      '@type': 'Review' as const,
      author: { '@type': 'Person' as const, name: authorName },
      ...(datePublished && { datePublished }),
      reviewRating: {
        '@type': 'Rating' as const,
        ratingValue: String(r.rating ?? 0),
        bestRating: '5',
        worstRating: '1',
      },
      ...(r.comment && { reviewBody: r.comment }),
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: (product as { title?: string }).title ?? '',
    ...(imageSrcs.length > 0 && { image: imageSrcs }),
    ...(description && { description }),
    ...((product as { sku?: string }).sku && {
      sku: (product as { sku?: string }).sku,
    }),
    brand: { '@type': 'Brand', name: BRAND_NAME },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: CURRENCY,
      price: String(price.toFixed(2)),
      availability: isOutOfStock(product)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(avgRating.toFixed(1)),
        reviewCount: String(reviewCount),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(schemaReviews.length > 0 && { review: schemaReviews }),
  };
};

/**
 * Renders the Product JSON-LD into the server HTML.
 *
 * Data comes from the cached `getProductForSchema` (no `connection()`, no per-request
 * work) so the schema body is FULLY INLINED in the HTML — fixing the production bug
 * where the `<script>` element existed but its body was empty (a streamed flight
 * placeholder), which made the Schema.org validator report no Product schema.
 *
 * The `<script>` is plain literal markup, so a spec-compliant HTML parser (Schema.org
 * validator / Googlebot raw-HTML pass / view-source) reads it WITHOUT executing JS —
 * verified with jsdom (runScripts disabled) finding `@type: Product`.
 */
async function ProductSchemaScript({ id }: { id: string }) {
  const product = await getProductForSchema(id);
  if (!product) return null;
  const slug = (product as { slug?: string }).slug || product._id;
  const jsonLd = JSON.stringify(buildProductSchema(product)).replace(
    /</g,
    '\\u003c'
  );
  return (
    <script
      id={toProductLdScriptDomId(String(slug))}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export const generateMetadata = async (props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const params = await props.params;
  // Use the CACHED fetch (not no-store) so metadata is prerenderable into the static
  // shell <head> — otherwise og:image/title get deferred out of the HTML Vercel serves.
  const product = await getProductForSchema(params.id);

  if (!product) {
    return {
      title: `Product Not Found | ${BRAND_NAME}`,
      description: 'The requested product could not be found.',
    };
  }

  const seo = product?.seo;

  const ogDescription =
    seo?.metaDescription ||
    product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
    `Shop ${product.title} at ${brand.identity.name}. ${brand.identity.tagline}.`;

  /**
   * og:image MUST be the product's real, full absolute image URL (e.g. the raw
   * Cloudinary URL) — never a `/_next/image` optimizer URL or a relative path,
   * otherwise crawlers (Googlebot, social scrapers) can't fetch the product image.
   * We take the raw stored URL (`image.url` / `img`) directly and force it absolute.
   */
  const rawOgImage =
    (product as { image?: { url?: string } }).image?.url ??
    (product as { img?: string }).img ??
    '';
  const ogImageUrl = rawOgImage ? toAbsoluteUrl(rawOgImage) : '';
  const ogImageAlt =
    (product as { image?: { altText?: string; title?: string } }).image?.altText ??
    (product as { image?: { title?: string } }).image?.title ??
    product.title ??
    '';

  return {
    metadataBase: new URL(SITE_URL),
    title: `${seo?.metaTitle || product.title}`,
    description:
      seo?.metaDescription ||
      product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
      '',
    keywords: seo?.metaKeywords || '',
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/product/${product.slug}`,
      title: product.title ?? '',
      description: ogDescription,
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            secureUrl: ogImageUrl,
            width: 1200,
            height: 630,
            alt: ogImageAlt,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title ?? '',
      description: ogDescription,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
};

export default async function ProductDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <div className="wf">
      <BrandTheme />
      {/* Product JSON-LD, inlined server-side so non-JS crawlers see it. */}
      <ProductSchemaScript id={id} />
      <Suspense fallback={<ProductContentSkeleton />}>
        <ProductBody id={id} />
      </Suspense>
    </div>
  );
}

/**
 * Editorial product layout (wireframe design 2), with the two changes the client
 * asked for in wireframe/final.md:
 *   1. Description / Fabric & Care / How to Use / Shipping & Returns are accordions
 *      in the LEFT column, under the gallery — not in the buy column.
 *   2. "Frequently Bought Together" is replaced by "Other Products You Can Choose".
 */
async function ProductBody({ id }: { id: string }) {
  const product = (await getProductForSchema(id)) as Record<string, any> | null;

  /**
   * Reached through an old slug: the API still resolves it from
   * `previousSlugs`, but the page should not stay on the retired URL. A
   * permanent redirect passes the search ranking on to the current one and
   * leaves a single canonical address for the product.
   */
  if (product?.slug && id !== product.slug && !/^[a-f\d]{24}$/i.test(id)) {
    permanentRedirect(`/product/${product.slug}`);
  }

  /**
   * A real 404, not a 200 carrying the words "not found". This covers a
   * deleted product and, now that the API hides drafts from the public
   * route, an unpublished one reached by its link — both should tell a
   * crawler the page is gone rather than have it index an empty shell.
   */
  if (!product) {
    notFound();
  }

  // Same-category first; fall back to the wider catalogue, since a small store
  // often has only one product per category and this block is "other products
  // you can choose", not strictly "related".
  const categories = await safe(() => getCategories(), [] as any);
  const categoryList = Array.isArray(categories)
    ? categories
    : ((categories as any)?.result ?? (categories as any)?.data ?? []);
  // The codebase carries two slug conventions — `parentCategoryModified` turns
  // "&" into "and", the shop's filter links keep the "&". Both resolve on the
  // backend, but the strip has to compare like with like to know which pill is
  // current, so it derives its own key from the name on both sides.
  const related = await safe(() => getRelatedProducts(product._id), [] as any);
  let others = toWfProducts(related, 8);
  if (others.length === 0) {
    const wider = await safe(
      () => getPaginatedProductsServer({ limit: 12, page: 1 }),
      null as any
    );
    others = toWfProducts(wider?.data ?? [], 12).filter(p => p.id !== String(product._id)).slice(0, 8);
  }

  const categorySlug = parentCategoryModified(product.category?.name ?? '');
  const categoryName = categorySlug
    .replace(/-/g, ' ')
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // The gallery's server render must be what the buy box will ask for on
  // hydration, otherwise the page paints the product's default photograph and
  // then visibly swaps to the selected colour's. `defaultVariantImages` is the
  // same function the grid's cards use, so all three agree.
  const productImages: string[] = [
    product.img,
    ...(Array.isArray(product.imageURLs)
      ? product.imageURLs.map((i: any) => i?.img ?? i).filter(Boolean)
      : []),
  ].filter(Boolean);
  const variantImages = defaultVariantImages(product);
  const images: string[] = variantImages.length ? variantImages : productImages;

  const price = Number(product.finalPriceDiscount ?? product.price ?? 0);
  const marked = Number(product.updatedPrice ?? product.price ?? 0);
  const outOfStock = isOutOfStock(product as any);
  /**
   * Rating averaged from the reviews themselves.
   *
   * It used to read `product.rating`, a field no product in the catalogue
   * actually carries — all 164 of them have it unset — so the real rating
   * was always undefined and the synthetic one always won. Averaging the
   * populated review documents is the only source that reflects what the
   * admin holds. Falls back to the stored field if one is ever written.
   */
  const reviewDocs = (Array.isArray(product.reviews) ? product.reviews : []) as Array<
    { rating?: number } | string
  >;
  const ratedReviews = reviewDocs.filter(
    (r): r is { rating?: number } =>
      typeof r === 'object' && r !== null && typeof r.rating === 'number'
  );
  const realReviewCount = reviewDocs.length;
  const realRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratedReviews.length
      : typeof product.rating === 'number'
        ? product.rating
        : undefined;

  /**
   * SYNTHETIC ratings, used until real reviews exist.
   *
   * No product has reviews yet, so the rating row would never render. These
   * figures are invented, seeded from the product id so each product keeps
   * the same numbers on every visit rather than shuffling per request —
   * a star count that changes on refresh is worse than none.
   *
   * They are NOT fed to the Product JSON-LD above, which still uses
   * `reviews` only: publishing fabricated aggregateRating to Google is
   * structured-data abuse and risks a manual action on the whole domain.
   *
   * To make real: delete this and pass realRating / realReviewCount.
   */
  /**
   * Real reviews only.
   *
   * These were a hash of the product id dressed up as a rating — every page
   * claimed 4.2-4.9 stars and a few hundred reviews that did not exist. The
   * count is now whatever the admin actually holds, and the block below
   * renders nothing at zero rather than inventing a number.
   */
  const rating = realRating;
  const reviewCount = realReviewCount;

  // Accordion content comes from the product where present, and is simply
  // omitted when the field is empty — no invented copy.
  const accordions = [
    product.description && { title: 'Description', body: String(product.description) },
    // "Ingredients" came from the beauty catalogue this layout was copied from.
    // `additionalInformation` here is fabric, care and measurements.
    product.additionalInformation?.length && {
      title: 'Fabric & Care',
      bullets: product.additionalInformation.map((a: any) =>
        [a?.key, a?.value].filter(Boolean).join(': ')
      ),
    },
    product.howToUse && { title: 'How to Use', body: String(product.howToUse) },
    {
      title: 'Shipping & Returns',
      body: 'Dispatched within 24 hours. Easy 7-day returns on unopened items.',
    },
  ].filter(Boolean) as { title: string; body?: string; bullets?: string[] }[];

  return (
    <>
      <div className="wf-wrap">
        <div className="wf-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/shop?category=${categorySlug}`}>{categoryName || 'Shop'}</Link>
          <span>/</span>
          {product.title}
        </div>

        {/* Wraps both grid columns so a colour picked in the buy box can swap the
            gallery, which sits in the other column. */}
        <VariantMediaProvider>
        <div className="wf-pdp">
          {/* LEFT: gallery only, pinned while the buy column scrolls past it.
              Sticking is scoped to the `.wf-pdp` grid, so the gallery releases
              exactly at the "You may also like" section below. */}
          <div className="wf-pdp-media">
            <WfPdpGallery
              images={images}
              title={product.title}
              badge={marked > price ? 'Sale' : undefined}
            />
          </div>

          {/* RIGHT: buy column, with the detail panels beneath it */}
          <div className="wf-pdp-info">
            {/* The category label that used to sit above the title is gone —
                the breadcrumb above already says where you are, and on a
                phone it was a wasted line before the thing being sold. */}
            {/* Stock reads as a badge at the end of the title rather than a
                line of its own, so availability is seen with the product
                name and costs no extra row on a phone. */}
            <h1 className="wf-pdp-title">
              {product.title}
              <span className={`wf-stock-badge${outOfStock ? ' out' : ''}`}>
                {outOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </h1>
            {/* Between the title and the SKU: social proof is read right
                after the product name, before the price is weighed. Hidden
                entirely with no reviews — an empty "0 reviews" pill is worse
                than nothing, and inventing a number is what this replaced. */}
            {reviewCount > 0 && rating !== undefined && (
              <div className="wf-pdp-rating">
                <WfStars rating={rating} /> {rating.toFixed(1)} ·{' '}
                <a href="#reviews">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </a>
              </div>
            )}

            {/* Shoppers quote the SKU when they contact us, and it is what the
                shop search matches on. */}
            {product.sku && <div className="wf-pdp-sku">SKU: {product.sku}</div>}

            <WfPdpBuyBox
              product={product}
              price={price}
              markedPrice={marked > price ? marked : undefined}
              outOfStock={outOfStock}
              taxNote="Inclusive of all taxes"
              assurances={wfAssurances}
              stickyTitle={product.title}
              stickyImage={images[0]}
            />

            <WfPdpAccordions items={accordions} />
          </div>
        </div>
        </VariantMediaProvider>
      </div>

      {/* Renamed from "Frequently Bought Together" per final.md */}
      <WfOtherProducts products={others} />

      {/* Always rendered, not only when a review exists: the section is
          also the only way to leave one, and a product with no reviews is
          exactly the product that needs the first. The star breakdown is
          counted from the reviews rather than assumed to be all five. */}
      <section
        className="wf-section"
        id="reviews"
        style={{ background: 'var(--wf-paper)', borderTop: '1px solid var(--wf-line)' }}
      >
        <div className="wf-wrap">
          <WfSectionHead eyebrow="What people say" title="Customer Reviews" center />
          <WfReviews
            productId={String(product._id)}
            reviews={reviewDocs as never}
          />
        </div>
      </section>

    </>
  );
}
