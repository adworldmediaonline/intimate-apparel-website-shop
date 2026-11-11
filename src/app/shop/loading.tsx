import { Loader2 } from 'lucide-react';

/**
 * Shop loading - simple centered spinner for route transitions.
 * Minimal UI for fast, clean loading state.
 */
export default function ShopLoading() {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center"
      aria-label="Loading shop"
    >
      <Loader2
        className="h-10 w-10 animate-spin text-primary"
        aria-hidden
      />
    </div>
  );
}
