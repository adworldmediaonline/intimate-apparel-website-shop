'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  Eye,
  Package,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: Array<{
    product: {
      _id: string;
      title: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
}

interface ProfileOrdersProps {
  orders: Order[];
  isLoading?: boolean;
  onViewOrder?: (orderId: string) => void;
}

const ProfileOrders: React.FC<ProfileOrdersProps> = ({
  orders,
  isLoading = false,
  onViewOrder,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-[var(--wf-sale)]" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'pending_pickup':
        return <Package className="h-4 w-4 text-sky-500" />;
      case 'shipped':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  /** The stored value is a key; `pending_pickup` must not reach a customer. */
  const formatStatus = (status: string) =>
    ({
      pending_pickup: 'Pending pickup',
      return_requested: 'Return requested',
      cancel: 'Cancelled',
    })[String(status ?? '').toLowerCase()] ??
    String(status ?? '').replace(/_/g, ' ');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_pickup':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Orders Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start shopping to see your order history here
            </p>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 5).map(order => (
            <div
              key={order._id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        order.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(order.status)}
                      {formatStatus(order.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      #{order.orderNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span>{CURRENCY_SYMBOL}{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{order.items.length} item(s)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span>{item.product.title}</span>
                        <span className="text-xs">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewOrder?.(order._id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {orders.length > 5 && (
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/orders">View All Orders</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOrders;
