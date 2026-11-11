'use client';

import { useEffect, useState } from 'react';

import brandConfig from '../../../brand.config.json';

type Compliance = {
  ageGate?: { enabled?: boolean; minimumAge?: number };
};

const gate = (brandConfig as { compliance?: Compliance }).compliance?.ageGate;
const ENABLED = gate?.enabled === true;
const MIN_AGE = gate?.minimumAge ?? 18;
const STORAGE_KEY = `age-gate:${brandConfig.brandKey}:v1`;

/**
 * Blocks the store until the visitor confirms they are old enough.
 *
 * Rendered for every page, so the answer is remembered per browser — asking on
 * each navigation would make the site unusable. It is a declaration, not proof
 * of age; that is what these gates are, and it is worth being clear about.
 *
 * Turn it off for a store by setting `compliance.ageGate.enabled` to false in
 * brand.config.json — no code change needed.
 */
export function WfAgeGate() {
  // `pending` until localStorage has been read: rendering the panel during SSR
  // would flash it at visitors who already answered, and hiding it by default
  // would flash the shop at those who have not.
  const [state, setState] = useState<'pending' | 'ask' | 'allowed' | 'denied'>(
    ENABLED ? 'pending' : 'allowed'
  );

  useEffect(() => {
    if (!ENABLED) return;
    let answered: string | null = null;
    try {
      answered = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private mode or blocked storage: ask again rather than fail open.
    }
    setState(answered === 'yes' ? 'allowed' : 'ask');
  }, []);

  useEffect(() => {
    // Keep the page behind the panel from scrolling underneath it.
    if (state !== 'ask' && state !== 'denied') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [state]);

  if (!ENABLED || state === 'allowed') return null;
  if (state === 'pending') {
    // An opaque cover, so no product imagery is visible for the moment it takes
    // to read localStorage.
    return <div className="wf wf-age-gate" aria-hidden="true" />;
  }

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // Not fatal — they will simply be asked again next visit.
    }
    setState('allowed');
  };

  const decline = () => {
    setState('denied');
    // Only works for windows opened by script, which a normal visit is not, so
    // the blocking notice below is the real behaviour rather than a fallback.
    try {
      window.close();
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="wf wf-age-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wf-age-gate-title"
    >
      <div className="wf-age-gate-panel">
        {state === 'ask' ? (
          <>
            <h2 id="wf-age-gate-title">Are you {MIN_AGE} or older?</h2>
            <p>
              {brandConfig.identity.name} sells products intended for adults. Please
              confirm your age to continue.
            </p>
            <div className="wf-age-gate-actions">
              <button type="button" className="wf-btn wf-btn-primary wf-btn-block" onClick={accept}>
                Yes, I am {MIN_AGE} or older
              </button>
              <button type="button" className="wf-btn wf-btn-outline wf-btn-block" onClick={decline}>
                No, I am under {MIN_AGE}
              </button>
            </div>
            <p className="wf-age-gate-note">
              We remember your answer on this device so you are not asked again.
            </p>
          </>
        ) : (
          <>
            <h2 id="wf-age-gate-title">You need to be {MIN_AGE} or older</h2>
            <p>
              Sorry — we cannot let you browse {brandConfig.identity.name}. Please close
              this tab.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default WfAgeGate;
