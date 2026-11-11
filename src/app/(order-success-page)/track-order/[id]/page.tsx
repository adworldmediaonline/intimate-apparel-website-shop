'use client';

import { StoreOrderTrackPage } from '@/components/store-order/store-order-track-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, use } from 'react';

function TrackOrderPageFallback() {
  return (
    <div className="py-8 lg:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function TrackOrderPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <StoreOrderTrackPage orderId={id} />;
}

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TrackOrderPageFallback />}>
      <TrackOrderPageContent params={params} />
    </Suspense>
  );
}
