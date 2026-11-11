'use client';

import React from 'react';
import type { FeaturedReview } from '@/server/reviews';
import { StarRating, reviewerName, Avatar } from './review-showcase-shared';

interface Props {
  reviews: FeaturedReview[];
}

const ReviewChip = ({
  review,
  ariaHidden = false,
}: {
  review: FeaturedReview;
  ariaHidden?: boolean;
}) => {
  const name = reviewerName(review);
  const product = review.productId;
  return (
    <div className="w-[300px] shrink-0" aria-hidden={ariaHidden || undefined}>
      <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90 line-clamp-3">
          {review.comment}
        </p>
        {product?.title && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            on {product.title}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Design 3 — continuous auto-scrolling strip (marquee).
 *
 * Pure CSS animation (not Swiper): the track holds two identical copies of the
 * reviews and slides by -50% on a loop, so it scrolls forever without gaps.
 * It pauses only on hover; clicks/taps can't stop a CSS animation.
 */
export default function ReviewsShowcaseMarquee({ reviews }: Props) {
  if (!reviews.length) return null;

  // Ensure a comfortably long base track so a single copy already overflows the
  // viewport — otherwise short lists leave a visible gap mid-loop.
  let base = reviews;
  while (base.length < 8) {
    base = [...base, ...reviews];
  }

  // ~5s of travel per chip keeps the speed consistent regardless of count.
  const durationSeconds = base.length * 5;

  return (
    <div
      className="reviews-marquee relative overflow-x-hidden py-2"
      style={{
        // Soft fade on both edges so chips slide in/out gracefully.
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        maskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div
        className="reviews-marquee-track flex w-max gap-4"
        style={
          {
            '--reviews-marquee-duration': `${durationSeconds}s`,
          } as React.CSSProperties
        }
      >
        {/* Two identical copies back-to-back → seamless -50% loop. The second
            copy is aria-hidden so screen readers don't read every review twice.
            Both halves must be structurally identical for the loop to align. */}
        {base.map((review, i) => (
          <ReviewChip key={`a-${review._id}-${i}`} review={review} />
        ))}
        {base.map((review, i) => (
          <ReviewChip key={`b-${review._id}-${i}`} review={review} ariaHidden />
        ))}
      </div>
    </div>
  );
}
