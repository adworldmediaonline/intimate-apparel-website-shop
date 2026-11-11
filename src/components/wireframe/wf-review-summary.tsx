import WfStars from './wf-stars';

export function WfReviewSummary({
  average,
  total,
  breakdown,
  onWriteReview,
}: {
  average: number;
  total: number;
  /** counts indexed 5★ down to 1★ */
  breakdown: number[];
  /** Opens the review form. Without it the button below did nothing at all. */
  onWriteReview?: () => void;
}) {
  const max = Math.max(1, ...breakdown);
  return (
    <div className="wf-review-summary">
      <div className="wf-rs-score">
        <div className="big">{average.toFixed(2)}</div>
        <WfStars rating={average} />
        <div style={{ fontSize: '.8rem', color: 'var(--wf-ink-soft)', marginTop: 6 }}>
          Based on {total} review{total === 1 ? '' : 's'}
        </div>
        <button
          type="button"
          className="wf-btn wf-btn-outline"
          style={{ marginTop: 14, padding: '9px 20px' }}
          onClick={onWriteReview}
        >
          Write a Review
        </button>
      </div>
      <div className="wf-rs-bars">
        {breakdown.map((count, i) => (
          <div className="wf-rs-bar" key={5 - i}>
            <span>{5 - i}★</span>
            <div className="track">
              <i style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WfReviewSummary;
