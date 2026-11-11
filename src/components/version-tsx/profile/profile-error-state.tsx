'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileErrorStateProps {
  error?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
}

const ProfileErrorState: React.FC<ProfileErrorStateProps> = ({
  error = 'Something went wrong while loading your profile',
  onRetry,
  onGoHome,
  onContactSupport
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">
            Profile Loading Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {onGoHome && (
              <Button 
                onClick={onGoHome} 
                className="w-full"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            )}
            
            <Button 
              asChild 
              className="w-full"
              variant="outline"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
            
            {onContactSupport && (
              <Button 
                onClick={onContactSupport} 
                className="w-full"
                variant="outline"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
            
            <Button 
              asChild 
              className="w-full"
              variant="outline"
            >
              <Link href="/contact">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              If this problem persists, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileErrorState;
