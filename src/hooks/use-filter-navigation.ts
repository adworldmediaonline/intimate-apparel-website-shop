'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition, useState } from 'react';

/**
 * Navigation for the shop's filter controls.
 *
 * Filtering is a server round-trip: the grid is rendered on the server, so every
 * category, colour, chip and "Clear all" is a link that re-requests /shop. With
 * a plain `<Link>` nothing happens visually until the new HTML arrives, so on a
 * slow connection the controls feel broken and get tapped repeatedly — which
 * queues up more round-trips and makes it worse.
 *
 * This wraps the push in a transition so the control can mark itself busy the
 * instant it is pressed, and ignores further presses while one is in flight.
 */
export function useFilterNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const navigate = useCallback(
    (href: string, event?: { preventDefault: () => void; metaKey?: boolean; ctrlKey?: boolean }) => {
      // Let modified clicks (open in new tab) behave normally.
      if (event?.metaKey || event?.ctrlKey) return;
      event?.preventDefault();
      setPendingHref(href);
      startTransition(() => {
        // `scroll: false` keeps the shopper where they were in the list rather
        // than throwing them back to the top on every filter change.
        router.push(href, { scroll: false });
      });
    },
    [router]
  );

  // The transition ends when the new page commits; clear the marker then.
  if (!isPending && pendingHref !== null) {
    setPendingHref(null);
  }

  return { navigate, isPending, pendingHref };
}

export default useFilterNavigation;
