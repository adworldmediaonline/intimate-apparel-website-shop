'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useStoreOrder } from '@/hooks/use-store-order';
import dayjs from 'dayjs';
import { ArrowRight, CheckCircle, ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';
import {
  hasJustPaid,
  useConfirmationAccessGuard,
} from './confirmation-access-guard';
import { toAnalyticsItem, trackPurchase } from '@/lib/analytics';
import { StoreOrderCouponAlert } from './store-order-coupon-alert';
import { StoreOrderLineItems } from './store-order-line-items';
import { StoreOrderLoading } from './store-order-loading';
import { StoreOrderMainColumns } from './store-order-main-columns';
import { StoreOrderNotFound } from './store-order-not-found';
import { StoreOrderSnapshotGrid } from './store-order-snapshot-card';
import { computeOrderDiscountBreakdown } from './store-order-utils';

interface StoreOrderConfirmationPageProps {
  /** Dynamic segment from the server page: `const { id } = await params` */
  orderId: string;
}

/**
 * How long the receipt stays on screen before moving the shopper on to order
 * tracking. Long enough to read the order number and total, short enough that
 * nobody is left wondering what happens next.
 */
const REDIRECT_AFTER_SECONDS = 8;

export const StoreOrderConfirmationPage = ({
  orderId,
}: StoreOrderConfirmationPageProps) => {
  const router = useRouter();
  const { isError, isPending, orderDoc } = useStoreOrder(orderId);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const access = useConfirmationAccessGuard(orderId);

  /**
   * The GA4 purchase event — the one that matters, and the one that must never
   * be reported twice. `oncePerSession` keys on the order, so a refresh or a
   * navigation back here does not book the sale again.
   */
  useEffect(() => {
    if (access !== 'granted' || !orderDoc) return;

    // Only the tab that actually paid reports the sale. The page itself is
    // open to anyone now, so without this every revisit — a shopper checking
    // their receipt, a support agent opening the link — would book the
    // conversion again.
    if (!hasJustPaid(orderId)) return;

    // A purchase with no id or no amount is worse than no purchase: it
    // reports a conversion that can never be reconciled against an order.
    const transactionId = String(orderDoc.orderId ?? orderDoc.invoice ?? '').trim();
    const value = Number(orderDoc.totalAmount);
    if (!transactionId || !Number.isFinite(value)) return;

    // trackPurchase dedupes on the transaction id itself.
    trackPurchase({
      transactionId,
      value,
      tax: Number(orderDoc.taxAmount ?? 0),
      shipping: Number(orderDoc.shippingCost ?? 0),
      coupon:
        orderDoc.appliedCoupons?.[0]?.couponCode ??
        orderDoc.appliedCoupon?.couponCode ??
        undefined,
      items: (orderDoc.cart ?? []).map(line =>
        toAnalyticsItem(line as Record<string, any>)
      ),
      customer: {
        email: orderDoc.email,
        phone: orderDoc.contact,
        firstName: String(orderDoc.name ?? '').split(' ')[0],
        lastName: String(orderDoc.name ?? '').split(' ').slice(1).join(' '),
        city: orderDoc.city,
        country: orderDoc.country,
      },
    });
  }, [access, orderDoc, orderId]);

  /**
   * Auto-forward to order tracking.
   *
   * Deliberately started only once `orderDoc` has arrived: the purchase event
   * fires on that same condition, and leaving the page before it ran would
   * lose the conversion. The countdown is shown rather than silent, and any
   * link on the page still works during it.
   */
  useEffect(() => {
    if (!orderDoc || isError) return;

    setSecondsLeft(REDIRECT_AFTER_SECONDS);
    const tick = setInterval(() => {
      setSecondsLeft(current => (current === null ? null : current - 1));
    }, 1000);
    const jump = setTimeout(() => {
      router.replace(`/track-order/${encodeURIComponent(orderId)}`);
    }, REDIRECT_AFTER_SECONDS * 1000);

    return () => {
      clearInterval(tick);
      clearTimeout(jump);
    };
  }, [orderDoc, isError, orderId, router]);

  if (!orderId) {
    return <StoreOrderNotFound />;
  }

  // Hold the skeleton while the guard decides, so a receipt never flashes up
  // for somebody who is about to be sent to tracking.
  if (access === 'checking' || isPending) {
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
  const orderUniqueId = orderDoc.orderId;
  const invoice = orderDoc.invoice;

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
                  Order Details
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" aria-hidden />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Order Confirmation
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your purchase! Your order has been successfully
                  placed.
                </p>
                {/* The forward is announced rather than silent, and the link
                    lets anyone who wants it skip the wait. */}
                {secondsLeft !== null && secondsLeft > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Taking you to order tracking in{' '}
                    <span className="font-semibold text-foreground">
                      {secondsLeft}
                    </span>{' '}
                    second{secondsLeft === 1 ? '' : 's'} ·{' '}
                    <Link
                      href={`/track-order/${encodeURIComponent(orderId)}`}
                      className="underline"
                    >
                      go now
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StoreOrderSnapshotGrid
              orderUniqueId={orderUniqueId}
              invoice={invoice}
              orderDate={orderDate}
              orderTime={orderTime}
              status={status}
            />
          </CardContent>
        </Card>

        <StoreOrderCouponAlert order={orderDoc} breakdown={breakdown} />

        <StoreOrderMainColumns order={orderDoc} breakdown={breakdown} />

        <StoreOrderLineItems cart={cart} />

        <div className="text-center mt-8">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Need help with your order? Contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Nothing sends the shopper to tracking on a timer any more, so
                  the way there has to be on the page. */}
              <Button asChild size="lg">
                <Link
                  href={`/track-order/${encodeURIComponent(orderId)}`}
                  className="flex items-center gap-2"
                >
                  <Truck className="w-5 h-5" aria-hidden />
                  Track Your Order
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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

      <Button
        asChild
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
        aria-label="Go back to shopping"
      >
        <Link href="/shop" className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" aria-hidden />
          Go Back to Shopping
        </Link>
      </Button>
    </div>
  );
};
