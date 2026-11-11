'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Package, Receipt } from 'lucide-react';
import { StoreOrderStatusBadge } from './store-order-status-badge';

interface StoreOrderSnapshotCardProps {
  orderUniqueId?: string;
  invoice?: string | number;
  orderDate: string;
  orderTime: string;
  status: string;
  /** When false, renders only the inner grid (for composing inside another Card). */
  withCardWrapper?: boolean;
}

export const StoreOrderSnapshotGrid = ({
  orderUniqueId,
  invoice,
  orderDate,
  orderTime,
  status,
}: Omit<StoreOrderSnapshotCardProps, 'withCardWrapper'>) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Order ID</p>
            <p className="text-lg font-semibold text-foreground font-mono">
              {orderUniqueId ?? invoice}
            </p>
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Order Date
            </p>
            <p className="text-lg font-semibold text-foreground">{orderDate}</p>
            <p className="text-sm text-muted-foreground">{orderTime}</p>
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="flex justify-center">
              <StoreOrderStatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>
);

export const StoreOrderSnapshotCard = ({
  withCardWrapper = true,
  ...props
}: StoreOrderSnapshotCardProps) => {
  if (!withCardWrapper) {
    return <StoreOrderSnapshotGrid {...props} />;
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <StoreOrderSnapshotGrid {...props} />
      </CardContent>
    </Card>
  );
};
