'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Package 
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Delivered',
        };
      case 'processing':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          text: 'Processing',
        };
      // Booked with the courier but not yet collected. Showing "Shipped"
      // here told the customer the parcel was travelling while it was
      // still on our shelf, and the courier's own tracking said nothing.
      case 'pending_pickup':
        return {
          color: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: <Package className="w-4 h-4" />,
          text: 'Pending pickup',
        };
      case 'shipped':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Truck className="w-4 h-4" />,
          text: 'Shipped',
        };
      case 'pending':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending',
        };
      case 'cancel':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Cancelled',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Package className="w-4 h-4" />,
          text: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.color} border`}>
      <span className="flex items-center gap-2">
        {config.icon}
        {config.text}
      </span>
    </Badge>
  );
};

export default OrderStatusBadge;
