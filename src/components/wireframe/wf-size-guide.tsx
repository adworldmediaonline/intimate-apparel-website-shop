'use client';

import { useEffect, useRef } from 'react';

import { BRAND_NAME } from '@/lib/brand';
import {
  BETWEEN_SIZES_NOTE,
  BRA_SIZE_MAPPING,
  HOW_TO_MEASURE,
  SIZE_MEASUREMENTS,
  STRETCH_NOTE,
} from '@/lib/size-guide';

/**
 * Size guide dialog, opened from the size selector on the product page.
 *
 * Content comes from `lib/size-guide`, shared with the standalone /size-guide
 * page so the two can never drift apart.
 */
export function WfSizeGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes, and the page behind must not scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="wf-sg-backdrop" onClick={onClose} role="presentation">
      <div
        className="wf-sg-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wf-sg-title"
        tabIndex={-1}
        ref={panel}
        onClick={event => event.stopPropagation()}
      >
        <div className="wf-sg-head">
          <h2 id="wf-sg-title">Size Guide</h2>
          <button type="button" onClick={onClose} aria-label="Close size guide">
            ×
          </button>
        </div>

        <div className="wf-sg-body">
          <section>
            <h3>Size chart — measurements in inches</h3>
            <div className="wf-sg-table-wrap">
              <table className="wf-sg-table">
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    <th scope="col">Bust</th>
                    <th scope="col">Waist</th>
                    <th scope="col">Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_MEASUREMENTS.map(row => (
                    <tr key={row.size}>
                      <th scope="row">{row.size}</th>
                      <td>{row.bust}</td>
                      <td>{row.waist}</td>
                      <td>{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3>Buying for her? Use her bra size</h3>
            <div className="wf-sg-table-wrap">
              <table className="wf-sg-table">
                <thead>
                  <tr>
                    <th scope="col">Her bra size</th>
                    <th scope="col">Pick</th>
                  </tr>
                </thead>
                <tbody>
                  {BRA_SIZE_MAPPING.map(row => (
                    <tr key={row.bra}>
                      <th scope="row">{row.bra}</th>
                      <td>{row.pick}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="wf-sg-note">
              {BETWEEN_SIZES_NOTE}
            </p>
          </section>

          <section>
            <h3>How to measure</h3>
            <ol className="wf-sg-steps">
              {HOW_TO_MEASURE.map((step, i) => (
                <li key={step.label}>
                  <span className="n">{i + 1}</span>
                  <span>
                    <b>{step.label}:</b> {step.body}
                  </span>
                </li>
              ))}
            </ol>
            <p className="wf-sg-note">
              {STRETCH_NOTE} Still unsure,{' '}
              <a href="/contact">get in touch</a> and we will help you pick.
            </p>
          </section>

          <p className="wf-sg-foot">
            Measurements are a guide. {BRAND_NAME} pieces are cut generously and
            most styles are highly stretchable.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WfSizeGuide;
