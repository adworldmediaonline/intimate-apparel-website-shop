import { Skeleton } from '@/components/ui/skeleton';

export const ProductContentSkeleton = () => {
  return (
    <div className="space-y-16">
      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery skeleton */}
        <div className="order-1 lg:order-1">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-20 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Product details skeleton */}
        <div className="order-2 lg:order-2 space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Options */}
          <Skeleton className="h-12 w-full" />

          {/* Add to cart */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 flex-1" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>

          {/* Details sections */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

