import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Static breadcrumb shell that renders immediately
 * Contains the "Home" link and a slot for dynamic content
 */
export const BreadcrumbShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        {/* Static Home Link - renders immediately */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </BreadcrumbSeparator>

        {/* Dynamic content slot with Suspense fallback */}
        {children}
      </BreadcrumbList>
    </Breadcrumb>
  );
};




