/**
 * USER_REMOVED - When user manually removes a coupon, we store cart state
 * so we don't auto-apply again until the cart changes.
 * Uses sessionStorage (match reference project).
 */

const USER_REMOVED_KEY = 'store-cart-user-removed';

export type UserRemovedState = {
  itemCount: number;
  subtotal: number;
};

export function loadUserRemoved(): UserRemovedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_REMOVED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserRemovedState;
    return parsed;
  } catch {
    return null;
  }
}

export function saveUserRemoved(itemCount: number, subtotal: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      USER_REMOVED_KEY,
      JSON.stringify({ itemCount, subtotal })
    );
  } catch {
    // ignore
  }
}

export function clearUserRemoved(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(USER_REMOVED_KEY);
  } catch {
    // ignore
  }
}
