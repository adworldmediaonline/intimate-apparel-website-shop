import { type NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * On-demand revalidation for CMS content (page metadata, page sections).
 * Called by the admin panel when content is updated so the live frontend
 * reflects changes immediately.
 *
 * Requires REVALIDATION_SECRET to match for security.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret ?? request.headers.get('x-revalidation-secret');

    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    // One content change can invalidate several tags (a page section is both
    // 'cms' and 'page-sections'), so `tag` takes a list as well as a string.
    const requested: unknown[] = Array.isArray(body.tag) ? body.tag : [body.tag ?? 'cms'];
    const tags: string[] = [
      ...new Set(
        requested
          .filter((t): t is string => typeof t === 'string' && t.trim() !== '')
          .map(t => t.trim())
      ),
    ];

    if (tags.length === 0) {
      return NextResponse.json({ error: 'No tag given' }, { status: 400 });
    }

    for (const tag of tags) revalidateTag(tag, { expire: 0 });

    return NextResponse.json({
      revalidated: true,
      tags,
      now: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
