'use client';

import { StoreOrderConfirmationPage } from '@/components/store-order/store-order-confirmation-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, use } from 'react';

function ConfirmationPageFallback() {
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

function ConfirmationPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <StoreOrderConfirmationPage orderId={id} />;
}

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ConfirmationPageFallback />}>
      <ConfirmationPageContent params={params} />
    </Suspense>
  );
}
