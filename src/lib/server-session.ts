import { cookies } from 'next/headers';

// Server-side session utility for Better Auth
export async function getServerSession() {
  try {
    const cookieStore = await cookies();

    // Get the session cookie
    const sessionCookie = cookieStore.get('better-auth-session');

    if (!sessionCookie) {
      return null;
    }

    // Make a request to the backend to verify the session
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092'}/api/me`,
      {
        headers: {
          Cookie: `better-auth-session=${sessionCookie.value}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    return null;
  }
}

// Alternative: Get session from JWT token in Authorization header
export async function getServerSessionFromToken(authorization?: string) {
  try {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092'}/api/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    return null;
  }
}
