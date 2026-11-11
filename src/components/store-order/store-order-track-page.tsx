'use client';

import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useStoreOrder } from '@/hooks/use-store-order';
import dayjs from 'dayjs';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { StoreOrderCouponAlert } from './store-order-coupon-alert';
import { StoreOrderLineItems } from './store-order-line-items';
import { StoreOrderLoading } from './store-order-loading';
import { StoreOrderMainColumns } from './store-order-main-columns';
import { StoreOrderNotFound } from './store-order-not-found';
import { StoreOrderShippingTrackCard } from './store-order-shipping-track-card';
import { StoreOrderSnapshotCard } from './store-order-snapshot-card';
import { computeOrderDiscountBreakdown } from './store-order-utils';

interface StoreOrderTrackPageProps {
  orderId: string;
}

export const StoreOrderTrackPage = ({ orderId }: StoreOrderTrackPageProps) => {
  const { isError, isPending, orderDoc } = useStoreOrder(orderId);

  if (!orderId) {
    return <StoreOrderNotFound />;
  }

  if (isPending) {
    return <StoreOrderLoading />;
  }

  if (isError || !orderDoc) {
    return <StoreOrderNotFound />;
  }

  const breakdown = computeOrderDiscountBreakdown(orderDoc);
  const createdAt = orderDoc.createdAt;
  const orderDate = createdAt
    ? dayjs(createdAt).format('MMMM D, YYYY')
    : '—';
  const orderTime = createdAt ? dayjs(createdAt).format('h:mm A') : '';
  const status = orderDoc.status ?? 'Processing';
  const cart = orderDoc.cart ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Track Order
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <StoreOrderSnapshotCard
          orderUniqueId={orderDoc.orderId}
          invoice={orderDoc.invoice}
          orderDate={orderDate}
          orderTime={orderTime}
          status={status}
        />

        <StoreOrderShippingTrackCard order={orderDoc} />

        <StoreOrderCouponAlert order={orderDoc} breakdown={breakdown} />

        <StoreOrderMainColumns order={orderDoc} breakdown={breakdown} />

        <StoreOrderLineItems cart={cart} />

        <div className="text-center mt-8">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Questions about delivery? We&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/shop" className="flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact" className="flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
