'use client';

import ClientOnlyWrapper from '@/components/client-only-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  Heart,
  Home,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  user,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const _router = useRouter();
  const _pathname = usePathname();

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Account summary and quick actions',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      description: 'Track your orders and view history',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your personal information',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Security and preferences',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      description: 'Your saved items',
    },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.image} alt={user?.name || user?.email} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {user?.name || user?.email}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/shop" onClick={() => setSidebarOpen(false)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={`text-xs ${
                      isActive
                        ? 'text-primary-foreground/80'
                        : 'text-primary-foreground'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background container mx-auto">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Profile</SheetTitle>
                <ClientOnlyWrapper>
                  <SidebarContent />
                </ClientOnlyWrapper>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-semibold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ShoppingCart className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border/50 bg-background/50 sticky top-0 h-screen overflow-y-auto">
          <ClientOnlyWrapper>
            <SidebarContent />
          </ClientOnlyWrapper>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to shop
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
