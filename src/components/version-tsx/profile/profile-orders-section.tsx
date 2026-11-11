'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import OrderCard from './order-card';

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending_pickup', label: 'Pending pickup' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancel', label: 'Cancelled' },
] as const;

interface ProfileOrdersSectionProps {
  userId?: string;
  maxOrders?: number;
  showViewAllButton?: boolean;
}

const ProfileOrdersSection: React.FC<ProfileOrdersSectionProps> = ({
  userId,
  maxOrders = 5,
  showViewAllButton = true,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch user orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch,
  } = useGetUserOrdersQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const allOrders = ordersData?.orders || [];

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return allOrders;
    return allOrders.filter(
      (o: { status?: string }) =>
        String(o.status || '').toLowerCase() === statusFilter.toLowerCase()
    );
  }, [allOrders, statusFilter]);

  const orders = filteredOrders;

  // Loading state
  if (ordersLoading) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription className="text-sm">
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription className="text-sm">
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-sm">
                Failed to load orders. Please try again later.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="w-full sm:w-auto"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no orders at all (before filter)
  if (!allOrders || allOrders.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription className="text-sm">
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No Orders Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start shopping to see your orders here.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Orders display (with optional filter - may show "no matches" when filtered)
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-sm">
              Track your order status and view order details
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {ORDER_STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                variant={statusFilter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(value)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm text-muted-foreground">
              No orders match the selected filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setStatusFilter('all')}
            >
              Clear filter
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.slice(0, maxOrders).map((order: any) => (
              <OrderCard key={order._id} order={order} />
            ))}

            {showViewAllButton && orders.length > maxOrders && (
              <div className="text-center pt-4">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link
                    href="/orders"
                    className="flex items-center justify-center gap-2"
                  >
                    View All Orders ({orders.length})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileOrdersSection;
