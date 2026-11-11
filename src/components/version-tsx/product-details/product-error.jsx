'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ProductError = ({ onRetry }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Unable to Load Product
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            We encountered an issue while loading the product details. Please
            try again or contact support if the problem persists.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onRetry}
            variant="default"
            size="lg"
            className="min-w-[140px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="min-w-[140px]"
          >
            Go Back
          </Button>
        </div>

        <Alert className="max-w-md mx-auto border-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If this issue continues, please check your internet connection or
            try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProductError;
