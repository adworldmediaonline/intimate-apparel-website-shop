import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies an image and returns it with Content-Disposition so the browser
 * uses the provided filename when saving (right-click Save image as, or open in new tab + save).
 */
/**
 * Hosts this proxy will fetch from. Without it the route is an open relay:
 * `/api/image?url=<anything>` made the server fetch any URL a caller named and
 * stream it back, billed as origin transfer and function time, and reachable
 * from inside the hosting network. Mirrors `images.remotePatterns` in
 * next.config.js — keep the two in step.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
  'i.ibb.co',
  'lh3.googleusercontent.com',
  'www.facebook.com',
]);

const isAllowedImageUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedImageUrl(url)) {
    return NextResponse.json({ error: 'Image host not allowed' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Intimate Apparel-Image/1.0' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/webp';
    const buffer = await res.arrayBuffer();

    const safeFilename =
      filename && typeof filename === 'string' && filename.length > 0 && filename.length < 256
        ? filename.replace(/[^\w.-]/g, '_')
        : 'image';

    const ext = safeFilename.includes('.') ? '' : '.webp';
    const downloadFilename = safeFilename.includes('.') ? safeFilename : `${safeFilename}${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${downloadFilename}"`,
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 502 }
    );
  }
}
