'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const ProfileLoadingState: React.FC = () => (
  <div className="min-h-screen bg-background container mx-auto">
    {/* Mobile Header Skeleton */}
    <div className="lg:hidden border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-10" />
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="flex">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden lg:block w-80 border-r border-border/50 bg-background/50 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* User Info Header Skeleton */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Navigation Skeleton */}
          <nav className="flex-1 p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Footer Skeleton */}
          <div className="p-4 border-t border-border/50">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 min-w-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header Section Skeleton */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Skeleton className="h-10 w-48 mb-2" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <Skeleton className="h-12 w-40" />
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default ProfileLoadingState;
