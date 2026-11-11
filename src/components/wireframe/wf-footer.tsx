import Link from 'next/link';
import {
  BRAND_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  activeSocialLinks,
  identity,
} from '@/lib/brand';

const SHOP_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'Bestsellers', href: '/shop?sort=best-selling' },
  { label: 'Offers', href: '/shop?sort=discount' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy-policy' },
];

const HELP_LINKS = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'FAQ', href: '/faq' },
];

const SOCIAL_ICON: Record<string, string> = {
  instagram: '📷',
  facebook: '📘',
  twitter: '🐦',
  youtube: '▶',
  linkedin: 'in',
};

export function WfFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="wf-footer">
      <div className="wf-wrap">
        <div className="wf-footer-top">
          <div className="wf-footer-brand">
            <div className="wf-brand">
              {BRAND_NAME}
              <i>.</i>
            </div>
            <p>{identity.description || identity.tagline}</p>
            <form className="wf-news-form">
              <input type="email" placeholder="Your email" aria-label="Email address" />
              <button className="wf-btn wf-btn-accent" type="submit">
                Join
              </button>
            </form>
          </div>

          <div className="wf-footer-col">
            <h4>Shop</h4>
            {SHOP_LINKS.map(l => (
              <Link href={l.href} key={l.label}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="wf-footer-col">
            <h4>Company</h4>
            {COMPANY_LINKS.map(l => (
              <Link href={l.href} key={l.label}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="wf-footer-col">
            <h4>Help</h4>
            {HELP_LINKS.map(l => (
              <Link href={l.href} key={l.label}>
                {l.label}
              </Link>
            ))}
            {SUPPORT_EMAIL && <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>}
            {SUPPORT_PHONE && (
              <Link href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`}>{SUPPORT_PHONE}</Link>
            )}
          </div>
        </div>

        <div className="wf-footer-bottom">
          <span>
            © {year} {identity.legalName || BRAND_NAME}. All rights reserved.
            {/* No postal address is shown anywhere on this site, by decision. */}
          </span>
          {activeSocialLinks.length > 0 && (
            <div className="wf-social">
              {activeSocialLinks.map(s => (
                <a key={s.name} href={s.url} aria-label={s.name} rel="noopener noreferrer" target="_blank">
                  {SOCIAL_ICON[s.name] ?? '→'}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default WfFooter;
