'use server';

import { authClient } from './authClient';
import { getSessionCookieHeader } from './cookie-utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8092';

/**
 * Server action to get current user session
 */
export async function getCurrentUser() {
  try {
    const session = await authClient.getSession();
    return session; // Return the session directly
  } catch (error) {
    console.error('Error getting current user:', error);
    return null; // Return null on error
  }
}

/**
 * Server action to test protected route
 */
export async function testProtectedRoute() {
  try {
    const session = await authClient.getSession();

    if (!session) {
      return {
        success: false,
        error: 'No active session',
        message: 'Please sign in to access protected routes',
      };
    }

    // Get cookies from the request to forward to API
    const cookieHeader = await getSessionCookieHeader();

    const response = await fetch(`${API_BASE_URL}/api/protected`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to access protected route',
        message: data.message,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error testing protected route:', error);
    return {
      success: false,
      error: 'Failed to test protected route',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to test public route (with optional auth)
 */
export async function testPublicRoute() {
  try {
    // Get cookies from the request to forward to API
    const cookieHeader = await getSessionCookieHeader();

    const response = await fetch(`${API_BASE_URL}/api/public`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to access public route',
        message: data.message,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error testing public route:', error);
    return {
      success: false,
      error: 'Failed to test public route',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to test admin route
 */
export async function testAdminRoute() {
  try {
    const session = await authClient.getSession();

    if (!session) {
      return {
        success: false,
        error: 'No active session',
        message: 'Please sign in to access admin routes',
      };
    }

    // Get cookies from the request to forward to API
    const cookieHeader = await getSessionCookieHeader();

    const response = await fetch(`${API_BASE_URL}/api/admin`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to access admin route',
        message: data.message,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error testing admin route:', error);
    return {
      success: false,
      error: 'Failed to test admin route',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to get user profile
 */
export async function getUserProfile() {
  try {
    const session = await authClient.getSession();

    if (!session) {
      return {
        success: false,
        error: 'No active session',
        message: 'Please sign in to access profile',
      };
    }

    // Get cookies from the request to forward to API
    const cookieHeader = await getSessionCookieHeader();

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to get profile',
        message: data.message,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: 'Failed to get user profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
