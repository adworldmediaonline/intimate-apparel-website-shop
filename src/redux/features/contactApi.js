import { apiSlice } from '../api/apiSlice';

export const contactApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    submitContact: builder.mutation({
      query: data => ({
        url: '/api/contact',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const { useSubmitContactMutation } = contactApi;
