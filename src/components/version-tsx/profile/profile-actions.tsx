'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  User,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ProfileActionsProps {
  onLogout?: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  onLogout,
  onEditProfile,
  onChangePassword,
}) => {
  const actionGroups = [
    {
      title: 'Account Management',
      actions: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your personal information',
          onClick: onEditProfile,
          variant: 'outline' as const,
        },
        {
          icon: Shield,
          label: 'Change Password',
          description: 'Update your account password',
          onClick: onChangePassword,
          variant: 'outline' as const,
        },
        {
          icon: Settings,
          label: 'Account Settings',
          description: 'Manage your account preferences',
          href: '/settings',
          variant: 'outline' as const,
        },
      ],
    },
    {
      title: 'Shopping & Orders',
      actions: [
        {
          icon: ShoppingBag,
          label: 'My Orders',
          description: 'View and track your orders',
          href: '/orders',
          variant: 'outline' as const,
        },
        {
          icon: Heart,
          label: 'Wishlist',
          description: 'View your saved products',
          href: '/wishlist',
          variant: 'outline' as const,
        },
        {
          icon: Star,
          label: 'My Reviews',
          description: 'Manage your product reviews',
          href: '/reviews',
          variant: 'outline' as const,
        },
      ],
    },
    {
      title: 'Support & Help',
      actions: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help and support',
          href: '/help',
          variant: 'outline' as const,
        },
        {
          icon: MapPin,
          label: 'Contact Support',
          description: 'Reach out to our team',
          href: '/contact',
          variant: 'outline' as const,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {actionGroups.map((group, groupIndex) => (
        <Card key={groupIndex}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.actions.map((action, actionIndex) => (
                <div key={actionIndex} className="space-y-3">
                  {action.href ? (
                    <Button
                      variant={action.variant}
                      className="w-full h-auto p-4 flex flex-col items-start gap-3 text-left"
                      asChild
                    >
                      <Link href={action.href}>
                        <action.icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant={action.variant}
                      className="w-full h-auto p-4 flex flex-col items-start gap-3 text-left"
                      onClick={action.onClick}
                    >
                      <action.icon className="h-5 w-4" />
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileActions;
