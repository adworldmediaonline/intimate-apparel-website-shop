'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/authClient';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';

import {
  ProfileDetails,
  ProfileLayout,
  ProfileLoadingState,
  ProfileOrdersSection,
  ProfileOrderStats,
  ProfileSettings,
  ProfileWishlist,
} from '@/components/version-tsx/profile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'overview',
    parse: value => {
      // Validate tab value to prevent invalid states
      const validTabs = ['overview', 'orders', 'profile', 'settings', 'wishlist'];
      return validTabs.includes(value) ? value : 'overview';
    },
  });

  useEffect(() => {
    if (!isPending && session) {
      if (!session) {
        router.push('/');
      } else if (session.user.role === 'admin') {
        router.push('/');
      } else if (session.user.role === 'super-admin') {
        router.push('/');
      } else if (session.user.role !== 'user') {
        router.push('/');
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <ProfileLoadingState />;
  }

  // Show loading while redirecting
  if (!session || !session.user) {
    return <ProfileLoadingState />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Welcome back, {session.user.name || session.user.email}!
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your profile, track orders, and view your account
                    information.
                  </p>
                </div>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href="/checkout">
                    Go to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href="/shop">
                    Continue Shopping
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Statistics */}
            <ProfileOrderStats userId={session.user.id} />

            {/* Profile Overview */}
            {/* <ProfileOverview user={session.user} /> */}
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Orders
              </h1>
              <p className="text-lg text-muted-foreground">
                Track your order status and view order history
              </p>
            </div>
            <ProfileOrdersSection
              userId={session.user.id}
              maxOrders={10}
              showViewAllButton={false}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Profile Information
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your personal information and account details
              </p>
            </div>
            <ProfileDetails user={session.user} />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Account Settings
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your security settings and preferences
              </p>
            </div>
            <ProfileSettings />
          </div>
        );

      case 'wishlist':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Wishlist
              </h1>
              <p className="text-lg text-muted-foreground">
                Your saved items and favorites
              </p>
            </div>
            <ProfileWishlist />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProfileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={session.user}
    >
      {renderTabContent()}
    </ProfileLayout>
  );
}
