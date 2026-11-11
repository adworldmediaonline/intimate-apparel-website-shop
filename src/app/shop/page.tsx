import { SITE_URL } from '@/lib/brand';
import Script from 'next/script';
import Link from 'next/link';

import { buildPageMetadata } from '@/lib/build-page-metadata';
import { getPageMetadata } from '@/server/page-metadata';
import { getPaginatedProductsServer, getProductColours } from '@/server/products';
import { enrichProductsWithDisplayPrices } from '@/server/enrich-products';
import { getCategories } from '@/lib/server-data';
import { DEFAULT_SHOP_SORT, resolveShopSort } from '@/lib/shop-sort';

import BrandTheme from '@/components/wireframe/brand-theme';
import WfFilterSidebar from '@/components/wireframe/wf-filter-sidebar';
import WfShopToolbar from '@/components/wireframe/wf-shop-toolbar';
import WfProductCard from '@/components/wireframe/wf-product-card';
import WfPagination from '@/components/wireframe/wf-pagination';
import WfTrustBar from '@/components/wireframe/wf-trust-bar';
import SearchTracker from '@/features/shop/components/search-tracker';

import { safe, toWfProducts } from '@/lib/wf-adapters';
import { sortByCategoryOrder } from '@/lib/category-order';
import brandConfig from '../../../brand.config.json';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('shop');
  return buildPageMetadata('shop', cmsData, {
    title: `${brandConfig.identity.name} — Shop`,
    description: brandConfig.seo.description,
    canonical: '/shop',
  });
}

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string;
    subcategory?: string;
    color?: string;
    search?: string;
    collection?: string;
    sort?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);

  // An unknown `sort` value falls back to Featured rather than 404ing or
  // passing an arbitrary field name through to the database.
  const sort = resolveShopSort(params?.sort?.trim());
  const collection = ['bestsellers', 'new-arrivals'].includes(
    params?.collection?.trim() ?? ''
  )
    ? (params?.collection?.trim() as 'bestsellers' | 'new-arrivals')
    : undefined;

  const filters = {
    category: params?.category?.trim() || undefined,
    subcategory: params?.subcategory?.trim() || undefined,
    color: params?.color?.trim() || undefined,
    // The header search box navigates to /shop?search=... . Without this the
    // param was dropped and every search returned the whole catalogue; the
    // backend already matches it against sku, title, description and keywords.
    search: params?.search?.trim() || undefined,
    homeRow: collection,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  // All three fetches are guarded so an unreachable backend renders an empty
  // shop rather than a 500.
  const [categories, colourFacet, productsResult] = await Promise.all([
    safe(() => getCategories(), [] as any),
    safe(() => getProductColours(), [] as any),
    safe(
      () => getPaginatedProductsServer({ limit: PAGE_SIZE, page, slim: true, ...filters }),
      null as any
    ),
  ]);

  const rawProducts = (productsResult?.data ?? []) as Array<Record<string, unknown>>;
  const enriched = await safe(
    () => enrichProductsWithDisplayPrices(rawProducts as any),
    rawProducts as any
  );
  const products = toWfProducts(enriched, PAGE_SIZE);

  const pagination = productsResult?.pagination ?? null;
  // The API's field is `totalProducts`; reading `total` always came back
  // undefined, so the toolbar reported the page size ("12 products") no matter
  // how many matched — very visible now that a colour filter can narrow it.
  const total = pagination?.totalProducts ?? products.length;
  const pages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const catList = Array.isArray(categories)
    ? categories
    : ((categories as any)?.result ?? (categories as any)?.data ?? []);

  const selectedCategories = filters.category?.split(',').filter(Boolean) ?? [];
  const selectedSubcategories = filters.subcategory?.split(',').filter(Boolean) ?? [];
  const selectedColours = filters.color?.split(',').filter(Boolean) ?? [];
  // Changing any filter drops back to page 1: page 4 of an unfiltered shop is
  // very often past the end of the filtered one.
  const filterHref = (
    categorySlugs: string[],
    subcategorySlugs: string[],
    colourSlugs: string[] = selectedColours
  ) => {
    const query = new URLSearchParams();
    if (collection) query.set('collection', collection);
    if (categorySlugs.length) query.set('category', categorySlugs.join(','));
    if (subcategorySlugs.length) query.set('subcategory', subcategorySlugs.join(','));
    if (colourSlugs.length) query.set('color', colourSlugs.join(','));
    if (filters.search) query.set('search', filters.search);
    if (sort.key !== DEFAULT_SHOP_SORT.key) query.set('sort', sort.key);
    return query.size ? `/shop?${query.toString()}` : '/shop';
  };
  const filterLabel = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const activeNames = [...selectedSubcategories, ...selectedCategories];
  const colourLabel = (slug: string) =>
    colourFacet.find((c: { slug: string }) => c.slug === slug)?.name ?? filterLabel(slug);
  const heading = filters.search
    ? `Results for "${filters.search}"`
    : activeNames.length
      ? activeNames.map(filterLabel).join(', ')
      : collection === 'bestsellers'
        ? 'Bestsellers'
        : collection === 'new-arrivals'
          ? 'New Arrivals'
          : 'Shop All';

  const sidebarCategories = sortByCategoryOrder(
    catList as any[],
    c => c?.parent ?? c?.name ?? c?.title
  )
    .map(c => {
      const label = c?.parent ?? c?.name ?? c?.title;
      if (!label) return null;
      const slug = String(label).toLowerCase().replace(/\s+/g, '-');
      const active = selectedCategories.includes(slug);
      /**
       * A category is a single choice, not a tick box: picking one clears
       * every other filter and shows just that category. Stacking two
       * categories plus a colour produced a result set nobody asked for and
       * was hard to get back out of. Clicking the active one clears it.
       */
      const categoryHref = (slugs: string[]) => {
        // Deliberately not filterHref: that carries the search term and the
        // collection through, and "show that only" means neither survives.
        // Sort is kept — it is a view preference, not a filter.
        const query = new URLSearchParams();
        if (slugs.length) query.set('category', slugs.join(','));
        if (sort.key !== DEFAULT_SHOP_SORT.key) query.set('sort', sort.key);
        return query.size ? `/shop?${query.toString()}` : '/shop';
      };
      const href = active ? categoryHref([]) : categoryHref([slug]);
      return {
        label,
        href,
        count: Array.isArray(c?.products) ? c.products.length : undefined,
        active,
      };
    })
    .filter(Boolean) as { label: string; href: string; count?: number; active?: boolean }[];

  const sidebarColours = (colourFacet as { name: string; slug: string; count: number }[])
    .map(c => {
      const active = selectedColours.includes(c.slug);
      const nextColours = active
        ? selectedColours.filter(value => value !== c.slug)
        : [...selectedColours, c.slug];
      return {
        label: c.name,
        href: filterHref(selectedCategories, selectedSubcategories, nextColours),
        count: c.count,
        active,
      };
    });

  const activeFilters = [
    ...selectedCategories.map(slug => ({
      label: filterLabel(slug),
      href: filterHref(selectedCategories.filter(value => value !== slug), selectedSubcategories),
    })),
    ...selectedSubcategories.map(slug => ({
      label: filterLabel(slug),
      href: filterHref(selectedCategories, selectedSubcategories.filter(value => value !== slug)),
    })),
    ...(filters.search
      ? [{
          label: `Search: ${filters.search}`,
          href: (() => {
            const q = new URLSearchParams();
            if (filters.category) q.set('category', filters.category);
            if (filters.subcategory) q.set('subcategory', filters.subcategory);
            if (filters.color) q.set('color', filters.color);
            if (collection) q.set('collection', collection);
            if (sort.key !== DEFAULT_SHOP_SORT.key) q.set('sort', sort.key);
            return q.size ? `/shop?${q.toString()}` : '/shop';
          })(),
        }]
      : []),
    ...selectedColours.map(slug => ({
      label: colourLabel(slug),
      href: filterHref(
        selectedCategories,
        selectedSubcategories,
        selectedColours.filter(value => value !== slug)
      ),
    })),
    ...(collection
      ? [{
          label: collection === 'bestsellers' ? 'Bestsellers' : 'New Arrivals',
          href: (() => {
            const q = new URLSearchParams();
            if (filters.category) q.set('category', filters.category);
            if (filters.subcategory) q.set('subcategory', filters.subcategory);
            if (filters.color) q.set('color', filters.color);
            if (filters.search) q.set('search', filters.search);
            if (sort.key !== DEFAULT_SHOP_SORT.key) q.set('sort', sort.key);
            return q.size ? `/shop?${q.toString()}` : '/shop';
          })(),
        }]
      : []),
  ];

  const shopUrl = activeNames.length || collection
    ? `${SITE_URL}/shop?${new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            category: filters.category,
            subcategory: filters.subcategory,
            collection,
          }).filter(
            ([, v]) => Boolean(v)
          ) as [string, string][]
        )
      ).toString()}`
    : `${SITE_URL}/shop`;

  const shopSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${heading} — ${brandConfig.identity.name}`,
    url: shopUrl,
    numberOfItems: total,
  };

  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (filters.category) q.set('category', filters.category);
    if (filters.subcategory) q.set('subcategory', filters.subcategory);
    if (filters.color) q.set('color', filters.color);
    if (filters.search) q.set('search', filters.search);
    if (collection) q.set('collection', collection);
    if (sort.key !== DEFAULT_SHOP_SORT.key) q.set('sort', sort.key);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `/shop?${s}` : '/shop';
  };

  return (
    <div className="wf">
      <BrandTheme />
      <Script
        id="shop-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />

      <div className="wf-wrap">
        <div className="wf-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          {(activeNames.length > 0 || collection) && (
            <>
              <span>/</span>
              {heading}
            </>
          )}
        </div>

        <div className="wf-shop-layout">
          <WfFilterSidebar
            categories={sidebarCategories}
            colours={sidebarColours}
            priceRange={{ min: 0, max: 5000 }}
          />

          <div>
            {/* The page is server-rendered, so this is the only thing on it
                that can report the search. Renders nothing. */}
            {filters.search && (
              <SearchTracker keyword={filters.search} resultsCount={total} />
            )}
            <WfShopToolbar count={total} activeFilters={activeFilters} />

            {products.length > 0 ? (
              <div className="wf-product-grid">
                {products.map(p => (
                  <WfProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--wf-ink-soft)', padding: '40px 0' }}>
                No products to show yet.
              </p>
            )}

            <WfPagination page={page} pages={pages} hrefFor={hrefFor} />
          </div>
        </div>
      </div>

      <WfTrustBar />
    </div>
  );
}
