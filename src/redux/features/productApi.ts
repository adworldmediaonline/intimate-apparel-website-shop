import { apiSlice } from '../api/apiSlice';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  homeRow?: 'bestsellers' | 'new-arrivals';
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductsResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getPaginatedProducts: builder.query<
      PaginatedProductsResponse,
      ProductFilters
    >({
      query: filters => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
        // Use Next.js API route for enriched products (display prices, no flicker)
        const path = `/api/shop/products?${params.toString()}`;
        const base =
          typeof window !== 'undefined' ? window.location.origin : '';
        return base ? `${base}${path}` : path;
      },
      keepUnusedDataFor: 5,
      providesTags: (result, _error, _arg) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({
              type: 'Products' as const,
              id: _id,
            })),
            { type: 'Products', id: 'LIST' },
          ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getAllProducts: builder.query<
      { data: unknown[]; pagination?: unknown },
      { publishStatus?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.publishStatus) {
          queryParams.append('publishStatus', params.publishStatus);
        }
        if (params?.page !== undefined) {
          queryParams.append('page', params.page.toString());
        }
        if (params?.limit !== undefined) {
          queryParams.append('limit', params.limit.toString());
        }
        const queryString = queryParams.toString();
        return queryString ? `/api/product/all?${queryString}` : '/api/product/all';
      },
      providesTags: ['Products'],
    }),
    getOfferProducts: builder.query({
      query: () => `/api/product/offer`,
      providesTags: ['OfferProducts'],
    }),
    getTopRatedProducts: builder.query({
      query: () => `/api/product/top-rated`,
      providesTags: ['TopRatedProducts'],
    }),
    // get single product
    getProduct: builder.query({
      query: (id: string) => `/api/product/single-product/${id}`,
      providesTags: (result, _error, id) => [{ type: 'Product', id }],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id: string) => `/api/product/related-product/${id}`,
      providesTags: (result, _error, id) => [{ type: 'RelatedProducts', id }],
    }),
  }),
});

export const {
  useGetPaginatedProductsQuery,
  useLazyGetPaginatedProductsQuery,
  useGetAllProductsQuery,
  useGetOfferProductsQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useLazyGetProductQuery,
  useGetRelatedProductsQuery,
} = productApi;
