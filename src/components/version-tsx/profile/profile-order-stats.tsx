'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ProfileOrderStatsProps {
  userId: string;
}

const ProfileOrderStats: React.FC<ProfileOrderStatsProps> = ({ userId }) => {
  // Fetch user orders for statistics - with better-auth, the backend handles authentication
  // The API call will include the session cookies automatically
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useGetUserOrdersQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  // Calculate order statistics
  const orderStats = {
    total: ordersData?.totalDoc || 0,
    pending: ordersData?.pending || 0,
    processing: ordersData?.processing || 0,
    shipped: ordersData?.shipped || 0,
    delivered: ordersData?.delivered || 0,
    cancelled: ordersData?.cancelled || 0,
  };

  const totalOrders = orderStats.total;
  const completedOrders = orderStats.delivered;
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Loading state
  if (ordersLoading) {
    return (
      <>
        {/* Order Statistics Cards - Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  // Error state or no data
  if (ordersError || !ordersData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {[
          { title: 'Total Orders', icon: Package, value: '0' },
          { title: 'Pending', icon: Clock, value: '0' },
          { title: 'Shipped', icon: Truck, value: '0' },
          { title: 'Delivered', icon: CheckCircle, value: '0' },
          { title: 'Cancelled', icon: AlertTriangle, value: '0' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state - no orders yet
  if (totalOrders === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No orders yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Start shopping to see your order history and track deliveries here.
          </p>
          <Button asChild size="lg">
            <Link href="/shop" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Order Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.shipped}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.delivered}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Progress */}
      {totalOrders > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Order Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Completed Orders
                </span>
                <span className="text-sm font-medium text-foreground">
                  {completedOrders} / {totalOrders}
                </span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {completionRate.toFixed(1)}% of your orders have been
                successfully delivered
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProfileOrderStats;
