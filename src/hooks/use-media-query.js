'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when the viewport matches the given media query.
 * Defaults to false on SSR and first render to avoid hydration mismatch.
 * @param {string} query - CSS media query (e.g. '(min-width: 1024px)')
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
