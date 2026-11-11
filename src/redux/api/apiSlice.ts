import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Cookie-based base query that handles session cookies
const cookieBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: 'include', // Include cookies with all requests
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Set content type for all requests
    headers.set('Content-Type', 'application/json');

    // Get session token from cookies and add to Authorization header as backup
    // This provides dual authentication: cookies + bearer token fallback
    const sessionToken =
      Cookies.get('backend.session_token') ||
      Cookies.get('__Secure-backend.session_token');

    if (sessionToken) {
      headers.set('Authorization', `Bearer ${sessionToken}`);
    }

    return headers;
  },
});

// Alternative: Proxy-based approach for server-side cookie handling
// This routes protected endpoints through a Next.js API route that can access server cookies
const proxyBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const endpointsRequiringServerCookies = [
    'testProtectedRoute',
    'testPublicRoute',
    'testAdminRoute',
    'getUserProfile',
    'getCurrentUser',
  ];

  // For endpoints that need server-side cookies, route through proxy
  if (endpointsRequiringServerCookies.includes(api.endpoint)) {
    const url = typeof args === 'string' ? args : args.url;
    const method = typeof args === 'string' ? 'GET' : args.method || 'GET';
    const body = typeof args === 'string' ? undefined : args.body;

    try {
      const response = await fetch(`/api/proxy${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      return {
        data: response.ok ? data : null,
        error: response.ok
          ? undefined
          : {
              status: response.status,
              data: data.error || data,
              message: data.message || 'Request failed',
            },
        meta: {
          response,
        },
      };
    } catch (error) {
      return {
        error: {
          status: 'FETCH_ERROR',
          data: error instanceof Error ? error.message : 'Unknown error',
          message: 'Network request failed',
        },
      };
    }
  }

  // For other endpoints, use the regular cookie-based query
  return cookieBaseQuery(args, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: proxyBaseQuery, // Use proxy-based query for better cookie handling
  endpoints: builder => ({
    // Session management endpoints
    getCurrentUser: builder.query({
      query: () => ({
        url: '/auth/session',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    // Route testing endpoints
    testProtectedRoute: builder.query({
      query: () => ({
        url: '/protected',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    testPublicRoute: builder.query({
      query: () => ({
        url: '/public',
        method: 'GET',
      }),
    }),

    testAdminRoute: builder.query({
      query: () => ({
        url: '/admin',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    // User profile endpoints
    getUserProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['User', 'Auth'],
    }),

    updateUserProfile: builder.mutation({
      query: profileData => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Authentication endpoints
    login: builder.mutation({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Registration endpoint
    register: builder.mutation({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
  tagTypes: [
    'Products',
    'Product',
    'RelatedProducts',
    'UserOrder',
    'UserOrders',
    'StoreOrder',
    'ProductType',
    'OfferProducts',
    'PopularProducts',
    'TopRatedProducts',
    'GuestCart',
    'CartAnalytics',
    'Contact',
    'User',
    'Auth',
  ],
});

// Export hooks for usage in components
export const {
  useGetCurrentUserQuery,
  useTestProtectedRouteQuery,
  useTestPublicRouteQuery,
  useTestAdminRouteQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} = apiSlice;
