import Link from 'next/link';

import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';

export interface CollectionTile {
  title: string;
  caption?: string;
  href: string;
  image?: string;
}

/**
 * Category cards: a tall lead tile beside a 2x2 of the rest, each showing the
 * whole photograph on a plain ground with its name on a bordered plate below.
 *
 * The picture is contained rather than cropped — these are product shots of
 * single items, and filling the frame cut the ends off a mop handle or a stack
 * of containers. Keeping the caption out of the image also means it no longer
 * has to survive whatever is behind it.
 */
export function WfCollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  if (!tiles.length) return null;
  return (
    <div className="wf-collections">
      {tiles.slice(0, 5).map((t, i) => (
        <Link
          href={t.href}
          key={t.title}
          className={`wf-col-tile${i === 0 ? ' big' : ''}`}
        >
          <span className="bg">
            {t.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryVariant(t.image, 400)}
                srcSet={cloudinarySrcSet(t.image, 400)}
                sizes="(max-width: 640px) 50vw, 25vw"
                alt=""
                /**
                 * Lazy left these blank for seconds after the grid was
                 * already on screen — it sits straight under the banner
                 * on a phone, not far below the fold.
                 *
                 * Eager but low priority: fetched from the start without
                 * competing with the banner, which is the LCP element.
                 * The lead tile stays lazy because CSS hides it below
                 * 700px, and a hidden lazy image is never fetched.
                 */
                loading={i === 0 ? 'lazy' : 'eager'}
                fetchPriority="low"
                decoding="async"
              />
            )}
          </span>
          <span className="cap">
            {t.caption && <small>{t.caption}</small>}
            <span className="h">{t.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default WfCollectionsGrid;
