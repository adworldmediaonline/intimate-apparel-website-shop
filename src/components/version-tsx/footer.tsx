import logo from '@assets/img/logo/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import brandConfig, { BRAND_NAME } from '@/lib/brand';
import CurrentYear from './current-year';
import SocialIcons from './social-icons';

/**
 * Site footer.
 *
 * Categories come from `commerce.categoryOrder` in brand.config.json rather than
 * from the API: that list is already the canonical seven in the canonical order,
 * and the footer sits in the root layout, where an API call would add latency to
 * every page and an outage would break the footer sitewide.
 */
const CATEGORY_LINKS = (
  (brandConfig.commerce as { categoryOrder?: string[] }).categoryOrder ?? []
).map(name => ({
  label: name,
  href: `/shop?category=${encodeURIComponent(
    name.toLowerCase().replace(/\s+/g, '-')
  )}`,
}));

const HELP_LINKS = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'FAQ', href: '/faq' },
];

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Returns Policy', href: '/returns' },
  { label: 'Shipping Policy', href: '/shipping' },
];

const linkClass =
  'text-masthead-foreground/70 hover:text-masthead-foreground transition-colors';

export default function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="bg-masthead text-masthead-foreground border-t border-border"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-3 md:px-6">
        {/* Three columns on a phone, not three stacked blocks: Shop, Help and
            Legal are short lists, and stacking them made the footer longer
            than the page above it. The brand block spans the full row. */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-8 py-10">
          {/* Brand */}
          <div className="col-span-3 sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Link href="/" aria-label="Go to homepage">
                <Image
                  src={logo}
                  alt={`${BRAND_NAME} Logo`}
                  width={180}
                  height={180}
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 180px"
                  className="block h-auto w-[150px] sm:w-[170px] md:w-[180px] object-contain"
                  style={{ height: 'auto' }}
                />
              </Link>
            </div>
            <div className="max-w-md">
              <p className="text-sm text-masthead-foreground/70 leading-relaxed">
                Discover the perfect blend of comfort and elegance. Shop our
                premium collection of silk and satin lingerie designed to make
                you feel beautiful every day.
              </p>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className={linkClass}>
                  About Us
                </Link>
              </li>
            </ul>

            <SocialIcons className="mt-5" />
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-masthead-foreground">
              Shop
            </h3>
            {/* Three columns across a phone leaves roughly 110px each, and
                "Lace & Body Stocking" has to fit in it. */}
            <ul className="mt-4 space-y-2 text-[11px] leading-snug sm:text-sm">
              {CATEGORY_LINKS.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-masthead-foreground">
              Help
            </h3>
            {/* Three columns across a phone leaves roughly 110px each, and
                "Lace & Body Stocking" has to fit in it. */}
            <ul className="mt-4 space-y-2 text-[11px] leading-snug sm:text-sm">
              {HELP_LINKS.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-masthead-foreground">
              Legal
            </h3>
            {/* Three columns across a phone leaves roughly 110px each, and
                "Lace & Body Stocking" has to fit in it. */}
            <ul className="mt-4 space-y-2 text-[11px] leading-snug sm:text-sm">
              {LEGAL_LINKS.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border py-4">
          <div className="text-xs text-masthead-foreground/70">
            © <CurrentYear /> {BRAND_NAME}. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
