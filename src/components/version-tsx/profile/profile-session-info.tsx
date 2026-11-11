'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ProfileSessionInfoProps {
  session: any;
}

const ProfileSessionInfo: React.FC<ProfileSessionInfoProps> = ({ session }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Session Information
        </CardTitle>
        <CardDescription>
          Current session details and authentication status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Session ID
            </label>
            <p className="text-sm text-foreground font-mono">
              {session.session.id}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Created At
            </label>
            <p className="text-sm text-foreground">
              {new Date(session.session.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Expires At
            </label>
            <p className="text-sm text-foreground">
              {new Date(session.session.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSessionInfo;
