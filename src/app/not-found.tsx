'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Breadcrumb */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Page Not Found
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Visual */}
          <div className="space-y-4">
            <div className="relative">
              <h1 className="text-8xl sm:text-9xl font-bold text-muted-foreground/20 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-destructive" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Sorry, we couldn't find the page you're looking for. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Return Home
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Still having trouble? Try these options:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Link href="/search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Products
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Link href="/contact" className="flex items-center gap-2">
                  Contact Support
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Spacing */}
      <div className="h-16" />
    </div>
  );
}
