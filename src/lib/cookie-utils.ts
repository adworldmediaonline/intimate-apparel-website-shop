import { cookies } from 'next/headers';

/**
 * Finds the session cookie - handles both development and production
 * Development: backend.session_token
 * Production: __Secure-backend.session_token (when secure: true)
 */
export async function findSessionCookie() {
  const cookieStore = await cookies();

  // Try the base name first (development)
  let sessionCookie = cookieStore.get('backend.session_token');

  // If not found, try with __Secure- prefix (production)
  if (!sessionCookie) {
    sessionCookie = cookieStore.get('__Secure-backend.session_token');
  }

  return sessionCookie || null;
}

/**
 * Gets the session cookie header for API requests
 * @returns Cookie header string or empty string if not found
 */
export async function getSessionCookieHeader(): Promise<string> {
  const sessionCookie = await findSessionCookie();
  return sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '';
}

/**
 * Checks if a session cookie exists
 * @returns True if session cookie exists, false otherwise
 */
export async function hasSessionCookie(): Promise<boolean> {
  const sessionCookie = await findSessionCookie();
  return !!sessionCookie;
}
