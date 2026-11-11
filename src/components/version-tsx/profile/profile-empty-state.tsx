'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, Star, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ProfileEmptyStateProps {
  type: 'profile' | 'orders' | 'wishlist' | 'reviews';
  onAction?: () => void;
}

const ProfileEmptyState: React.FC<ProfileEmptyStateProps> = ({
  type,
  onAction,
}) => {
  const getEmptyStateConfig = (type: string) => {
    switch (type) {
      case 'profile':
        return {
          icon: User,
          title: 'Complete Your Profile',
          description:
            'Add your personal information to get the most out of your account',
          actionText: 'Complete Profile',
          actionHref: '/profile/edit',
        };
      case 'orders':
        return {
          icon: ShoppingBag,
          title: 'No Orders Yet',
          description: 'Start shopping to see your order history here',
          actionText: 'Start Shopping',
          actionHref: '/shop',
        };
      case 'wishlist':
        return {
          icon: Heart,
          title: 'Your Wishlist is Empty',
          description: 'Save products you love to your wishlist for later',
          actionText: 'Browse Products',
          actionHref: '/shop',
        };
      case 'reviews':
        return {
          icon: Star,
          title: 'No Reviews Yet',
          description: "Share your thoughts on products you've purchased",
          actionText: 'Shop Now',
          actionHref: '/shop',
        };
      default:
        return {
          icon: User,
          title: 'Nothing Here',
          description: 'This section is empty',
          actionText: 'Get Started',
          actionHref: '/',
        };
    }
  };

  const config = getEmptyStateConfig(type);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <config.icon className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-3">
            {config.title}
          </h3>

          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {config.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onAction ? (
              <Button onClick={onAction}>{config.actionText}</Button>
            ) : (
              <Button asChild>
                <Link href={config.actionHref}>{config.actionText}</Link>
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEmptyState;
