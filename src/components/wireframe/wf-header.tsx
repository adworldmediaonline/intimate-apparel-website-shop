import Link from 'next/link';
import { BRAND_NAME, SUPPORT_PHONE } from '@/lib/brand';

export interface MegaColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface WfHeaderProps {
  /** Mega-menu columns. Falls back to a plain "Shop" link when empty. */
  megaColumns?: MegaColumn[];
  /** Promoted tile at the end of the mega menu. */
  feature?: { title: string; caption: string; href: string; image?: string };
  cartCount?: number;
  announcement?: string;
}

const DEFAULT_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'Bestsellers', href: '/shop?sort=best-selling' },
];

export function WfHeader({
  megaColumns = [],
  feature,
  cartCount = 0,
  announcement,
}: WfHeaderProps) {
  const hasMega = megaColumns.length > 0;

  return (
    <>
      {announcement && (
        <div className="wf-announce" dangerouslySetInnerHTML={{ __html: announcement }} />
      )}

      <header className="wf-header">
        <div className="wf-header-inner">
          <nav className="wf-nav-left">
            {hasMega ? (
              <div className="wf-has-mega">
                <Link href="/shop">Shop ▾</Link>
                <div className="wf-mega">
                  <div className="wf-mega-grid">
                    {megaColumns.slice(0, 4).map(col => (
                      <div className="wf-mega-col" key={col.heading}>
                        <h5>{col.heading}</h5>
                        {col.links.map(l => (
                          <Link href={l.href} key={`${col.heading}-${l.label}`}>
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                    {feature && (
                      <Link href={feature.href} className="wf-mega-feature">
                        {feature.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={feature.image} alt="" loading="lazy" />
                        )}
                        <div className="cap">
                          <b>{feature.title}</b>
                          <span style={{ fontSize: '.74rem' }}>{feature.caption} →</span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/shop">Shop</Link>
            )}
            {DEFAULT_LINKS.slice(1).map(l => (
              <Link href={l.href} key={l.label}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="wf-brand">
            {BRAND_NAME}
            <i>.</i>
          </Link>

          <nav className="wf-nav-right">
            <Link href="/search">Search</Link>
            <Link href="/profile">Account</Link>
            {SUPPORT_PHONE && <Link href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`}>Call</Link>}
            <Link href="/cart" className="wf-icon-btn" aria-label="Cart">
              🛍
              {cartCount > 0 && <span className="wf-cart-count">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export default WfHeader;
