/**
 * FNV-1a, 32-bit.
 *
 * Used to derive numbers that must look arbitrary but stay the same for a
 * given key — a product's placeholder rating, for instance, which would be
 * worse than useless if it changed on every render or every request.
 *
 * Not a cryptographic hash and not meant to be one; it is chosen for being
 * short, dependency-free and identical on server and client, which matters
 * because a value that differs between the two breaks hydration.
 */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}
