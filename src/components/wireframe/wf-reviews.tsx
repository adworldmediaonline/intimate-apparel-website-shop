'use client';

import { useMemo, useState } from 'react';

import WfReviewSummary from './wf-review-summary';
import WfStars from './wf-stars';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type WfReview = {
  _id?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  reviewerName?: string;
  guestName?: string;
  verifiedPurchase?: boolean;
  userId?: { name?: string } | string | null;
};

const nameOf = (review: WfReview) => {
  if (review.reviewerName) return review.reviewerName;
  if (review.userId && typeof review.userId === 'object' && review.userId.name) {
    return review.userId.name;
  }
  if (review.guestName) return review.guestName;
  return 'Verified shopper';
};

const dateOf = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

/**
 * The reviews section of the product page: the score, the reviews
 * themselves, and a form to add one.
 *
 * The page used to render only the summary — the score and the star bars —
 * so a review added in the admin changed a number and nothing else. What
 * the customer wrote was never shown anywhere on the storefront, and the
 * "Write a Review" button was a bare <button> with no handler.
 *
 * A review needs a name, a rating and a comment; no account, matching what
 * POST /api/review/add accepts.
 */
export function WfReviews({
  productId,
  reviews,
}: {
  productId: string;
  reviews: WfReview[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const { average, total, breakdown } = useMemo(() => {
    const rated = reviews.filter(r => typeof r.rating === 'number');
    const counts = [0, 0, 0, 0, 0]; // 5★ down to 1★
    for (const review of rated) {
      const index = 5 - Math.min(5, Math.max(1, Math.round(review.rating ?? 0)));
      counts[index] += 1;
    }
    return {
      average: rated.length
        ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
        : 0,
      total: reviews.length,
      breakdown: counts,
    };
  }, [reviews]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError('Please add your name and a few words.');
      return;
    }
    setState('sending');
    setError('');
    try {
      const res = await fetch(`${API}/api/review/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || 'Could not save your review.');
      }
      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Could not save your review.');
    }
  };

  return (
    <>
      <WfReviewSummary
        average={average}
        total={total}
        breakdown={breakdown}
        onWriteReview={() => setOpen(value => !value)}
      />

      {open && (
        <div className="wf-review-form">
          {state === 'done' ? (
            <p>
              Thank you — your review has been received and will appear here
              shortly.
            </p>
          ) : (
            <form onSubmit={submit}>
              <label>
                Your name
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={60}
                  placeholder="e.g. Priya S."
                  required
                />
              </label>

              <label>
                Rating
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map(value => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Your review
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="How was the fit, the fabric, the delivery?"
                  required
                />
              </label>

              {error && <p className="wf-review-error">{error}</p>}

              <button
                type="submit"
                className="wf-btn wf-btn-accent"
                disabled={state === 'sending'}
              >
                {state === 'sending' ? 'Sending…' : 'Post review'}
              </button>
            </form>
          )}
        </div>
      )}

      <ul className="wf-review-list">
        {reviews.map((review, index) => (
          <li key={review._id ?? index}>
            <div className="wf-review-head">
              <strong>{nameOf(review)}</strong>
              {review.verifiedPurchase && (
                <span className="wf-review-verified">Verified purchase</span>
              )}
              <time>{dateOf(review.createdAt)}</time>
            </div>
            <WfStars rating={review.rating ?? 0} />
            {review.comment && <p>{review.comment}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}

export default WfReviews;
