'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    joinDate?: string;
    avatar?: string;
  };
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground">
            Profile Information
          </CardTitle>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {user.name}
              </h2>
              <Badge variant="secondary" className="text-sm">
                Member since {user.joinDate || 'N/A'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-3 text-muted-foreground md:col-span-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
