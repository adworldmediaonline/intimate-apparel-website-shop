const STORAGE_KEY = 'shop_cart_intent_session_v2';

/**
 * Anonymous session key for correlating add-to-cart events (stored in localStorage).
 */
export const getOrCreateShopCartIntentSessionKey = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) {
      return existing;
    }
    const key = `sci_${crypto.randomUUID()}`;
    window.localStorage.setItem(STORAGE_KEY, key);
    return key;
  } catch {
    return `sci_fb_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
};
