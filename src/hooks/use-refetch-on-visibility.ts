'use client';

import { useState, useEffect } from 'react';

/**
 * Returns a refetch key that increments when the document becomes visible.
 * Use as a dependency to refetch store settings (coupons, etc.) when the user
 * returns to the tab, so admin updates are reflected immediately.
 */
export function useRefetchOnVisibility(): number {
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefetchKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return refetchKey;
}
