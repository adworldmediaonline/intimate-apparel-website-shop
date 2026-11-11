'use client';

import { useEffect, useRef } from 'react';

/** What the pincode check found, as the dialog needs it. */
export interface DeliveryDetails {
  pincode: string;
  /** Formatted date range, e.g. "24 Oct – 27 Oct". Absent when unserviceable. */
  window?: string;
  unserviceable?: boolean;
  /** "Dispatched today if ordered before 3 PM", or tomorrow after the cut-off. */
  dispatch: string;
}

/**
 * Delivery details, shown after a pincode check.
 *
 * A dialog rather than a panel under the input: the detail only matters in
 * the moment it is asked for, and inline it pushed Add to Cart down the
 * page every time somebody checked.
 *
 * Mirrors WfSizeGuide's behaviour deliberately — Escape to close, backdrop
 * click, scroll lock, focus moved to the panel — so the two dialogs on this
 * page behave identically.
 */
export function WfDeliveryDialog({
  open,
  details,
  onClose,
}: {
  open: boolean;
  details: DeliveryDetails | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

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

  if (!open || !details) return null;

  return (
    <div className="wf-sg-backdrop" onClick={onClose} role="presentation">
      <div
        className="wf-sg-panel wf-delivery-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wf-delivery-title"
        tabIndex={-1}
        ref={panel}
        onClick={event => event.stopPropagation()}
      >
        <div className="wf-sg-head">
          <h2 id="wf-delivery-title">
            {details.unserviceable ? 'Not deliverable' : 'Delivery details'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close delivery details">
            ×
          </button>
        </div>

        <div className="wf-delivery-body">
          {details.unserviceable ? (
            <p className="wf-delivery-bad">
              We do not deliver to <strong>{details.pincode}</strong> yet. Try
              another pincode, or contact us and we will see what we can do.
            </p>
          ) : (
            <>
              <p className="wf-delivery-headline">
                Estimated delivery <strong>{details.window}</strong>
              </p>
              <p className="wf-delivery-to">to pincode {details.pincode}</p>

              <ul className="wf-delivery-list">
                <li>{details.dispatch}</li>
                <li>Free delivery on this order</li>
                <li>Discreet packaging — plain outer box, no branding</li>
                <li>7-day easy returns</li>
                <li>Pay online, or on delivery where available</li>
              </ul>

              <p className="wf-delivery-note">
                Dates are an estimate from our courier and can shift with
                weather, holidays and local conditions.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WfDeliveryDialog;
