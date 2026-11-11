export const DEFAULT_SITE_URL = 'https://unwrapher.com';

export const getSiteUrl = (
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL
): string => {
  const rawSiteUrl = siteUrl?.trim() || DEFAULT_SITE_URL;

  try {
    const url = new URL(rawSiteUrl);
    const pathname = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');

    return `${url.origin}${pathname}`;
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export const getAbsoluteUrl = (pathname: string): string => {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return `${getSiteUrl()}${normalizedPathname}`;
};
