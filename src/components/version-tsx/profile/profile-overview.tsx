'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Settings, Shield, Package, Mail } from 'lucide-react';
import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';

interface ProfileOverviewProps {
  user: any;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Information */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm text-foreground font-medium">
                  {user.name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm text-foreground font-medium">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p className="text-sm text-foreground font-mono text-xs">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Verified
                </label>
                <div className="mt-1">
                  {user.emailVerified ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link
                href="/profile?tab=profile"
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Update Profile
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link
                href="/profile?tab=settings"
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Security Settings
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link href="/orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                View All Orders
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileOverview;
