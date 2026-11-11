'use client';

import { useEffect, useRef, useState } from 'react';

import { useVariantImages } from './wf-variant-media';

/** Minimum horizontal travel before a touch counts as a swipe, in px. */
const SWIPE_THRESHOLD = 45;

export function WfPdpGallery({
  images,
  title,
  badge,
  giftNote,
}: {
  images: string[];
  title: string;
  badge?: string;
  giftNote?: string;
}) {
  const variantImages = useVariantImages();
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // A selected colour replaces the default set; falling back keeps the gallery
  // working on products that have no per-variant photography.
  const list = variantImages?.length ? variantImages : images.length ? images : [''];

  // Reset to the first frame when the set changes, otherwise picking a colour
  // while viewing photo 4 can land on an index the new set does not have.
  const signature = list.join('|');
  useEffect(() => {
    setActive(0);
  }, [signature]);

  const count = list.length;
  /** Wraps, so swiping past either end continues round rather than dead-ending. */
  const step = (delta: number) => setActive(i => (i + delta + count) % count);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    // Only act when the gesture is clearly horizontal, or scrolling the page
    // past a tall photograph would flick through the images by accident.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
  };

  return (
    <div className="wf-gallery">
      <div
        className="wf-main-img"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={e => {
          if (count < 2) return;
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        }}
        // Focusable so the arrow keys work for anyone not using touch.
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? 'group' : undefined}
        aria-label={count > 1 ? `${title} — image ${active + 1} of ${count}` : undefined}
      >
        {badge && <span className="wf-badge wf-badge-best">{badge}</span>}
        {list[active] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={list[active]} alt={title} fetchPriority="high" draggable={false} />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              className="wf-gal-nav prev"
              onClick={() => step(-1)}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 5.5 8 12l6.5 6.5" />
              </svg>
            </button>
            <button
              type="button"
              className="wf-gal-nav next"
              onClick={() => step(1)}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9.5 5.5 16 12l-6.5 6.5" />
              </svg>
            </button>
            <div className="wf-gal-dots" aria-hidden="true">
              {list.map((src, i) => (
                <span key={src + i} className={i === active ? 'on' : ''} />
              ))}
            </div>
          </>
        )}

        {giftNote && <div className="wf-gift-flag">{giftNote}</div>}
      </div>

      {count > 1 && (
        <div className="wf-thumbs">
          {list.slice(0, 10).map((src, i) => (
            <button
              type="button"
              key={src + i}
              className={`wf-thumb${i === active ? ' on' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${count}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WfPdpGallery;
