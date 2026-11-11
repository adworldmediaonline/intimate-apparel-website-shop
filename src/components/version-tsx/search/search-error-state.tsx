import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SearchErrorStateProps {
  error: any;
}

export default function SearchErrorState({ error }: SearchErrorStateProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Search Results</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* Error Message */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive mb-2">
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                We encountered an error while loading the search results. Please
                try again.
              </p>

              {error && (
                <div className="bg-background border border-border rounded-lg p-4 text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    Error details:
                  </p>
                  <code className="text-xs text-destructive bg-destructive/10 p-2 rounded block">
                    {error?.message || 'Unknown error occurred'}
                  </code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </Button>

                <Button asChild variant="outline" size="lg">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Return Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
