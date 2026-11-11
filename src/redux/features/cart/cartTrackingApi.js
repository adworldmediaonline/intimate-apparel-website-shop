import { apiSlice } from '@/redux/api/apiSlice';

export const cartTrackingApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Track add to cart event
    trackAddToCart: builder.mutation({
      query: data => ({
        url: 'api/cart-tracking/track/add-to-cart',
        method: 'POST',
        body: data,
      }),
    }),

    // Track cart actions (remove, update quantity, etc.)
    trackCartAction: builder.mutation({
      query: data => ({
        url: 'api/cart-tracking/track/cart-action',
        method: 'POST',
        body: data,
      }),
    }),

    // Track conversion when order is placed
    trackConversion: builder.mutation({
      query: data => ({
        url: 'api/cart-tracking/track/conversion',
        method: 'POST',
        body: data,
      }),
    }),

    // Get cart analytics (admin only)
    getCartAnalytics: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `api/cart-tracking/analytics?${params.toString()}`;
      },
      providesTags: ['CartAnalytics'],
    }),

    // Get conversion funnel
    getCartConversionFunnel: builder.query({
      query: ({ days = 30 } = {}) =>
        `api/cart-tracking/analytics/conversion-funnel?days=${days}`,
      providesTags: ['CartAnalytics'],
    }),

    // Get popular products
    getPopularProducts: builder.query({
      query: ({ limit = 10, days = 30 } = {}) =>
        `api/cart-tracking/analytics/popular-products?limit=${limit}&days=${days}`,
      providesTags: ['CartAnalytics'],
    }),

    // Get user cart journey
    getUserCartJourney: builder.query({
      query: ({ userId, sessionId }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        return `api/cart-tracking/analytics/user-journey?${params.toString()}`;
      },
      providesTags: ['CartAnalytics'],
    }),

    // Bulk track cart events
    bulkTrackCartEvents: builder.mutation({
      query: data => ({
        url: 'api/cart-tracking/bulk-track',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useTrackAddToCartMutation,
  useTrackCartActionMutation,
  useTrackConversionMutation,
  useGetCartAnalyticsQuery,
  useGetCartConversionFunnelQuery,
  useGetPopularProductsQuery,
  useGetUserCartJourneyQuery,
  useBulkTrackCartEventsMutation,
} = cartTrackingApi;
