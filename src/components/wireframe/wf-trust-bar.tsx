import type { ReactNode } from 'react';

export interface TrustItem {
  /** Key into ICONS, or a ready-made node for a caller-supplied mark. */
  icon: keyof typeof ICONS | ReactNode;
  label: string;
}

/**
 * Line icons drawn in the brand accent, sharing one 24px box and one stroke
 * weight so the row reads as a set.
 *
 * Each glyph is nudged so its *ink* — the length-weighted centroid of every
 * stroke — sits on (12,12), not its bounding box. For line art the two differ:
 * a padlock's heavy body drags it low, a truck's cab sits above its wheels.
 *
 * Every mark is also symmetric enough that its correction is almost entirely
 * vertical. That matters inside a circular disc: a sideways nudge leaves the
 * glyph hugging one edge with a visible crescent of space on the other. The
 * "Made in India" mark was a flag for that reason — its pole put all the stroke
 * length on the left, so ink-centring pushed it 1.9 units right. A shield reads
 * the same and balances on its own axis.
 *
 * Emoji were used before. They render in each platform's own colours and
 * cartoon style, so they ignored the brand palette and differed per device.
 */
/** Exported so the PDP trust strip draws the same marks as this bar. */
export const ICONS = {
  dispatch: (
    <>
      <g transform="translate(0.17 -0.56)">
        <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="16.5" r="1.8" />
        <circle cx="17" cy="16.5" r="1.8" />
      </g>
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  invoice: (
    <>
      <g transform="translate(-0.0 0.23)">
        <path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21z" />
        <path d="M9.5 8h5M9.5 12h5" />
      </g>
    </>
  ),
  returns: (
    <>
      <g transform="translate(0.17 0.37)">
        <path d="M4 12a8 8 0 1 0 2.6-5.9" />
        <path d="M4 4v4h4" />
      </g>
    </>
  ),
  secure: (
    <>
      <g transform="translate(-0.0 -0.4)">
        <rect x="5" y="10" width="14" height="9" rx="1.6" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
      </g>
    </>
  ),
  india: (
    <>
      <g transform="translate(0.0 1.29)">
        <path d="M12 3.5L19 6v5.5L12 20.5 5 11.5V6z" />
        <circle cx="12" cy="10" r="2.3" />
      </g>
    </>
  ),
  // A plain sealed carton — nothing on the outside says what is inside, which
  // is the whole point of the promise.
  packaging: (
    <>
      <g transform="translate(0 -0.35)">
        <path d="M3.5 7.5L12 4l8.5 3.5v9L12 20l-8.5-3.5z" />
        <path d="M3.5 7.5L12 11l8.5-3.5" />
        <path d="M12 11v9" />
      </g>
    </>
  ),
} as const;

const DEFAULTS: TrustItem[] = [
  { icon: 'packaging', label: 'Discreet Packaging' },
  { icon: 'dispatch', label: 'Fast Dispatch' },
  { icon: 'cash', label: 'COD Available' },
  { icon: 'invoice', label: 'GST Invoice' },
  { icon: 'returns', label: 'Easy Returns' },
  { icon: 'secure', label: 'Secure Checkout' },
  { icon: 'india', label: 'Made in India' },
];

export function WfTrustBar({ items = DEFAULTS }: { items?: TrustItem[] }) {
  return (
    <div className="wf-trust-bar">
      <div className="wf-wrap">
        <div className="wf-trust-grid">
          {items.map(item => (
            <div className="wf-trust-item" key={item.label}>
              <span className="ic" aria-hidden="true">
                {typeof item.icon === 'string' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ICONS[item.icon as keyof typeof ICONS]}
                  </svg>
                ) : (
                  item.icon
                )}
              </span>
              <span className="t">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WfTrustBar;
