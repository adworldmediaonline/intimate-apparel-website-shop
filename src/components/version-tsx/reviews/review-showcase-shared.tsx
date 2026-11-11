'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { FeaturedReview } from '@/server/reviews';

/** Five-star row; rounds half-stars to nearest full for the showcase. */
export const StarRating = ({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'md';
}) => {
  const full = Math.round(rating);
  const dim = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < full
              ? `${dim} fill-[var(--wf-sale)] text-[var(--wf-sale)]`
              : `${dim} text-muted-foreground/30`
          }
        />
      ))}
    </div>
  );
};

export const reviewerName = (review: FeaturedReview): string =>
  review.userId?.name?.trim() || review.guestName?.trim() || 'Verified Customer';

export const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

/** Avatar bubble with the reviewer's initials. */
export const Avatar = ({
  name,
  size = 'sm',
}: {
  name: string;
  size?: 'sm' | 'md';
}) => {
  const dim = size === 'md' ? 'h-12 w-12 text-sm' : 'h-9 w-9 text-xs';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${dim}`}
    >
      {initials(name)}
    </div>
  );
};
