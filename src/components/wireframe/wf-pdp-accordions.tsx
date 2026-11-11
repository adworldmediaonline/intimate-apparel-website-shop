'use client';

import { useState } from 'react';

export interface AccordionEntry {
  title: string;
  /** Plain paragraph text, or a list of bullet points. */
  body?: string;
  bullets?: string[];
}

/**
 * Per the client note in wireframe/final.md these panels sit in the LEFT column,
 * below the product details — not in the right-hand buy column.
 */
export function WfPdpAccordions({ items }: { items: AccordionEntry[] }) {
  const [open, setOpen] = useState(0);
  if (!items.length) return null;

  return (
    <div className="wf-accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className="wf-acc-item" key={item.title}>
            <button
              type="button"
              className="wf-acc-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              {item.title}
              <span className="pm">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="wf-acc-body">
                {item.bullets?.length ? (
                  <ul>
                    {item.bullets.map(b => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  item.body
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WfPdpAccordions;
