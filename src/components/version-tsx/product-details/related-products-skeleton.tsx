import { Skeleton } from '@/components/ui/skeleton';

export const RelatedProductsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <Skeleton className="h-8 w-64 mx-auto sm:mx-0 mb-2" />
        <Skeleton className="h-5 w-80 mx-auto sm:mx-0" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

