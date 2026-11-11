'use client';

import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
} from 'lucide-react';

const getStatusColorClass = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'delivered') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (statusLower === 'processing') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (statusLower === 'pending_pickup') {
    return 'bg-sky-100 text-sky-800 border-sky-200';
  }
  if (statusLower === 'shipped') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (statusLower === 'cancelled') {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'delivered') {
    return <CheckCircle className="w-4 h-4" aria-hidden />;
  }
  if (statusLower === 'processing') {
    return <Clock className="w-4 h-4" aria-hidden />;
  }
  if (statusLower === 'pending_pickup') {
    return <Package className="w-4 h-4" aria-hidden />;
  }
  if (statusLower === 'shipped') {
    return <Truck className="w-4 h-4" aria-hidden />;
  }
  if (statusLower === 'cancelled') {
    return <AlertTriangle className="w-4 h-4" aria-hidden />;
  }
  return <Package className="w-4 h-4" aria-hidden />;
};

/** The stored value is a key, not something to show a customer. */
const LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  pending_pickup: 'Pending pickup',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancel: 'Cancelled',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  returned: 'Returned',
  refunded: 'Refunded',
};

const label = (status: string) =>
  LABELS[status?.toLowerCase()] ?? String(status ?? '').replace(/_/g, ' ');

export const StoreOrderStatusBadge = ({ status }: { status: string }) => (
  <Badge className={`${getStatusColorClass(status)} border`}>
    <span className="flex items-center gap-2">
      {getStatusIcon(status)}
      {label(status)}
    </span>
  </Badge>
);
