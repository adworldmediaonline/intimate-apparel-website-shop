import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

interface SearchEmptyStateProps {
  message: string;
  searchText?: string;
  productType?: string;
}

export default function SearchEmptyState({
  message,
  searchText,
  productType,
}: SearchEmptyStateProps) {
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
            <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Message */}
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                No Results Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">{message}</p>

              {searchText && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your search:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-sm">
                      "{searchText}"
                    </Badge>
                    {productType && (
                      <Badge variant="outline" className="text-sm">
                        Type: {productType}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="text-left bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Try these suggestions:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Check your spelling</li>
                  <li>• Try more general keywords</li>
                  <li>• Remove filters to broaden your search</li>
                  <li>• Browse our categories instead</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild variant="default" size="lg">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Browse All Products
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
