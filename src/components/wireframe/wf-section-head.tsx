import Link from 'next/link';

export function WfSectionHead({
  eyebrow,
  title,
  linkHref,
  linkLabel = 'View all',
  center = false,
}: {
  eyebrow?: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
  center?: boolean;
}) {
  return (
    <div className={`wf-section-head${center ? ' center' : ''}`}>
      <div className="htext">
        {eyebrow && <span className="wf-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {linkHref && !center && (
        <Link href={linkHref} className="wf-link-arrow">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default WfSectionHead;
