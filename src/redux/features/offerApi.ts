import { apiSlice } from '../api/apiSlice';

export type OfferCrossSellProduct = {
  _id: string;
  title?: string;
  slug?: string;
  img?: string;
  imageURLs?: { img?: string }[];
  price?: number;
  finalPriceDiscount?: number;
  updatedPrice?: number;
  options?: unknown[];
  variants?: unknown[];
  colors?: unknown[];
  sizes?: unknown[];
};

export type OfferCrossSellRes = {
  success: boolean;
  data: {
    /** True when an admin picked these, false when they are the catalogue fallback. */
    curated: boolean;
    products: OfferCrossSellProduct[];
  };
};

export const offerApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // What to suggest when the basket is one item short of a free one.
    // Its own endpoint, not part of the cart quote: this list does not
    // change as the basket does, so it is fetched once and cached.
    getOfferCrossSell: builder.query<OfferCrossSellRes, void>({
      query: () => '/api/offer/cross-sell',
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOfferCrossSellQuery } = offerApi;
