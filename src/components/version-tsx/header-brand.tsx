import { BRAND_LOGO_ALT } from '@/lib/brand';


import logo from '@assets/img/logo/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';

export interface HeaderBrandProps {
  href?: string;
  ariaLabel?: string;
}

export function HeaderBrand({
  href = '/',
  ariaLabel = 'Go to homepage',
}: HeaderBrandProps): ReactElement {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center py-2"
    >
      <Image
        src={logo}
        alt={BRAND_LOGO_ALT}
        priority
        placeholder="blur"
        width={(logo as unknown as { width: number }).width}
        height={(logo as unknown as { height: number }).height}
        sizes="(max-width: 480px) 170px, (max-width: 768px) 210px, 260px"
        // The mark is a wide wordmark now, not the old square badge. Sized by
        // height alone it ran ~340px across and crowded the menu and the cart
        // icon off a phone, so it is capped by width with the height left to
        // follow.
        className="h-auto max-h-9 w-auto max-w-[170px] object-contain sm:max-w-[210px] md:max-h-11 md:max-w-[260px]"
        style={{ width: 'auto', height: 'auto' }}
      />
    </Link>
  );
}

export default HeaderBrand;
