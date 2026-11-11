'use client';
import { useGetAllProductsQuery } from '@/redux/features/productApi';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import SearchControls from './search-controls';
import SearchEmptyState from './search-empty-state';
import SearchErrorState from './search-error-state';
import SearchHeader from './search-header';
import SearchResults from './search-results';
import SearchSkeleton from './search-skeleton';

// Types
interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  productType?: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category?: {
    name: string;
    id: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: Array<{
    rating: number;
  }>;
}

export default function SearchArea() {
  const searchParams = useSearchParams();
  const searchText = searchParams.get('q') || '';
  const productType = searchParams.get('productType') || '';

  const {
    data: products,
    isError,
    isLoading,
    error,
  } = useGetAllProductsQuery({
    publishStatus: 'published',
    limit: 10000,
  });
  const [sortValue, setSortValue] = useState<string>('default');
  const [perView] = useState(8);
  const [next, setNext] = useState(perView);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortValue(value);
    setNext(perView); // Reset pagination when sorting changes
  };

  // Handle load more
  const handleLoadMore = () => {
    setNext(prev => prev + 4);
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = (): Product[] => {
    if (!products?.data || !Array.isArray(products.data)) return [];

    let filteredProducts = products.data as Product[];

    // Apply search filter
    if (searchText) {
      filteredProducts = filteredProducts.filter(
        (product: Product) =>
          product.title.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply product type filter
    if (productType) {
      filteredProducts = filteredProducts.filter(
        (product: Product) =>
          product.productType?.toLowerCase() === productType.toLowerCase()
      );
    }

    // Apply sorting
    switch (sortValue) {
      case 'price-low-high':
        filteredProducts = [...filteredProducts].sort(
          (a: Product, b: Product) => Number(a.price) - Number(b.price)
        );
        break;
      case 'price-high-low':
        filteredProducts = [...filteredProducts].sort(
          (a: Product, b: Product) => Number(b.price) - Number(a.price)
        );
        break;
      case 'name-asc':
        filteredProducts = [...filteredProducts].sort(
          (a: Product, b: Product) => a.title.localeCompare(b.title)
        );
        break;
      case 'name-desc':
        filteredProducts = [...filteredProducts].sort(
          (a: Product, b: Product) => b.title.localeCompare(a.title)
        );
        break;
      default:
        // Keep original order
        break;
    }

    return filteredProducts;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const hasResults = filteredProducts.length > 0;
  const canLoadMore = next < filteredProducts.length;

  // Loading state
  if (isLoading) {
    return <SearchSkeleton />;
  }

  // Error state
  if (isError) {
    return <SearchErrorState error={error} />;
  }

  // No products at all
  if (!products?.data || products.data.length === 0) {
    return <SearchEmptyState message="No products available at the moment." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Breadcrumb */}
      <SearchHeader
        searchText={searchText}
        totalProducts={products.data.length}
        filteredProducts={filteredProducts.length}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Controls */}
        <SearchControls
          sortValue={sortValue}
          onSortChange={handleSortChange}
          totalProducts={products.data.length}
          filteredProducts={filteredProducts.length}
          currentPage={next}
        />

        {/* Results */}
        {!hasResults ? (
          <SearchEmptyState
            message={`No products found matching "${searchText}"`}
            searchText={searchText}
            productType={productType}
          />
        ) : (
          <SearchResults
            products={filteredProducts}
            currentPage={next}
            onLoadMore={handleLoadMore}
            canLoadMore={canLoadMore}
          />
        )}
      </main>
    </div>
  );
}
