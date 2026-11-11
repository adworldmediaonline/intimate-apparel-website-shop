'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { CURRENCY_SYMBOL } from '@/lib/brand';

import {
  Award,
  Clock,
  Heart,
  ShoppingBag,
  Star,
  TrendingUp,
} from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistItems: number;
    reviews: number;
    memberSince: string;
    loyaltyPoints?: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      description: 'Orders placed',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Spent',
      value: `${CURRENCY_SYMBOL}${stats.totalSpent.toFixed(2)}`,
      description: 'Lifetime spending',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Heart,
      label: 'Wishlist Items',
      value: stats.wishlistItems.toString(),
      description: 'Saved products',
      color: 'bg-[var(--wf-brand)]/10 text-[var(--wf-brand)]',
    },
    {
      icon: Star,
      label: 'Reviews',
      value: stats.reviews.toString(),
      description: 'Product reviews',
      color: 'bg-yellow-500/10 text-yellow-600',
    },
    {
      icon: Clock,
      label: 'Member Since',
      value: stats.memberSince,
      description: 'Join date',
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      icon: Award,
      label: 'Loyalty Points',
      value: stats.loyaltyPoints?.toString() || '0',
      description: 'Earned points',
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className={`p-2 rounded-full ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileStats;
