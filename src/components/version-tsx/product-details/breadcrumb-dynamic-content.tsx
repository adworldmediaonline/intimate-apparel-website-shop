import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Dynamic breadcrumb content - renders category and product title
 * This component will stream in after the static shell
 */
export const BreadcrumbDynamicContent = ({
  categoryName,
  productTitle,
  categorySlug,
}: {
  categoryName: string;
  productTitle: string;
  categorySlug: string;
}) => {
  return (
    <>
      {/* Category Link */}
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link
            href={`/shop?category=${categorySlug}`}
            className="text-muted-foreground hover:text-foreground transition-colors capitalize"
          >
            {categoryName}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>

      <BreadcrumbSeparator>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </BreadcrumbSeparator>

      {/* Product Title */}
      <BreadcrumbItem>
        <BreadcrumbPage className="text-foreground font-medium">
          {productTitle}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </>
  );
};

