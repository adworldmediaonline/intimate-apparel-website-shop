'use client'; // Error boundaries must be Client Components

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error. Don't worry, we're here to help!
          </p>
        </div>

        {/* Error Card */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-xl font-semibold text-destructive">
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Error message:
              </div>
              <div className="font-mono text-sm text-foreground break-words">
                {error.message || 'An unexpected error occurred'}
              </div>
              {error.digest && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                variant="default"
                size="lg"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Link href="/">
                  <Home className="h-5 w-5" />
                  Return Home
                </Link>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                If the problem persists, you can:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <span className="hidden sm:inline text-muted-foreground">
                  •
                </span>
                <Button
                  onClick={() => window.history.back()}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            This error has been automatically logged for our team to
            investigate.
          </p>
        </div>
      </div>
    </div>
  );
}
