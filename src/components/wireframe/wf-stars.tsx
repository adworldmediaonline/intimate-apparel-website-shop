/** Star rating rendered as text, matching the wireframe's ★ treatment. */
export function WfStars({ rating = 5 }: { rating?: number }) {
  const full = Math.round(rating);
  return (
    <span className="wf-stars" aria-label={`${rating.toFixed(1)} out of 5`}>
      {'★'.repeat(Math.min(5, full))}
      {'☆'.repeat(Math.max(0, 5 - full))}
    </span>
  );
}

export default WfStars;
