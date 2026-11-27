import Link from 'next/link';

import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';
import type { Collection } from '@/server/collections';

/**
 * Shop by Occasion: wide banner tiles, two across.
 *
 * Each tile is a cover photograph under a colour wash. The wash is what makes
 * the white type legible — a photograph chosen in the admin can be any
 * brightness, and type laid straight on one is a coin toss. The tint rotates
 * through four brand colours so adjacent tiles stay apart.
 *
 * A collection with no cover photograph is drawn on the tint alone rather
 * than skipped: the shop would rather show the collection than hide it
 * because nobody has uploaded a picture yet.
 */
export function WfCollectionTiles({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;

  return (
    <div className="wf-coll-tiles">
      {collections.map((collection, index) => (
        <Link
          key={collection.key}
          href={`/shop?collection=${encodeURIComponent(collection.key)}`}
          className={`wf-coll-tile tint-${index % 4}`}
          aria-label={`${collection.title} — ${collection.productCount} pieces`}
        >
          {collection.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="cover"
              src={cloudinaryVariant(collection.image, 800)}
              srcSet={cloudinarySrcSet(collection.image, 800)}
              sizes="(max-width: 720px) 100vw, 50vw"
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
          <span className="body">
            {collection.icon && (
              <span className="icon" aria-hidden="true">
                {collection.icon}
              </span>
            )}
            <span className="spacer" />
            <span className="title">{collection.title}</span>
            {collection.tagline && <span className="tagline">{collection.tagline}</span>}
            {collection.linkLabel && <span className="to">{collection.linkLabel}</span>}
            <span className="cta">Shop &rarr;</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default WfCollectionTiles;
