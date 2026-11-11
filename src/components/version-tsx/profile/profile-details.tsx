'use client';

import { authClient } from '@/lib/authClient';
import { notifyError, notifySuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Pencil, User } from 'lucide-react';
import React, { useState } from 'react';

interface ProfileDetailsProps {
  user: any;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const { refetch: refetchSession } = authClient.useSession();

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      notifyError('Name cannot be empty');
      return;
    }
    if (trimmed === (user.name || '')) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    const { error } = await authClient.updateUser({ name: trimmed });
    setIsSaving(false);
    if (error) {
      notifyError(error.message ?? 'Failed to update name');
      return;
    }
    notifySuccess('Name updated successfully');
    await refetchSession();
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setNameValue(user.name || '');
    setIsEditingName(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Details
        </CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Full Name
            </label>
            {isEditingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-3 bg-muted rounded-md flex-1">
                  {user.name || 'Not provided'}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNameValue(user.name || '');
                    setIsEditingName(true);
                  }}
                  aria-label="Edit name"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="p-3 bg-muted rounded-md">{user.email}</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Account Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                User ID
              </label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {user.id}
              </div>
            </div> */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Verification
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
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDetails;
