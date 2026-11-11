/**
 * Decode a dynamic route segment without throwing on malformed `%` sequences.
 * Next.js usually passes an already-decoded `id`; extra decode is only when `%` is present.
 */
export const safeDecodeRouteSegment = (value: string | undefined): string => {
  const raw = (value ?? '').trim();
  if (!raw) {
    return '';
  }
  if (!raw.includes('%')) {
    return raw;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
