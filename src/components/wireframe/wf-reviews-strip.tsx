import WfStars from './wf-stars';

export interface WfReview { quote: string; author: string; meta?: string; rating?: number }

export function WfReviewsStrip({ reviews }: { reviews: WfReview[] }) {
  if (!reviews.length) return null;
  return (
    <div className="wf-reviews">
      {reviews.slice(0, 3).map(r => (
        <div className="wf-review-card" key={r.author + r.quote.slice(0, 16)}>
          <WfStars rating={r.rating ?? 5} />
          <p>&ldquo;{r.quote}&rdquo;</p>
          <div className="wf-review-who">
            {r.author}
            {r.meta && <small>{r.meta}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default WfReviewsStrip;
