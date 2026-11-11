import { apiSlice } from '@/redux/api/apiSlice';

export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Save guest cart
    saveGuestCart: builder.mutation({
      query: data => ({
        url: 'api/cart/guest',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GuestCart'],
    }),

    // Get guest cart by email
    getGuestCart: builder.query({
      query: email => `api/cart/guest/${email}`,
      providesTags: ['GuestCart'],
    }),

    // Update guest cart
    updateGuestCart: builder.mutation({
      query: ({ email, cartItems }) => ({
        url: `api/cart/guest/${email}`,
        method: 'PUT',
        body: { cartItems },
      }),
      invalidatesTags: ['GuestCart'],
    }),

    // Delete guest cart
    deleteGuestCart: builder.mutation({
      query: email => ({
        url: `api/cart/guest/${email}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GuestCart'],
    }),
  }),
});

export const {
  useSaveGuestCartMutation,
  useGetGuestCartQuery,
  useUpdateGuestCartMutation,
  useDeleteGuestCartMutation,
} = cartApi;
