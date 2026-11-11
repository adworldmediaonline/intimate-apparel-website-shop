'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageIcon, ArrowRightIcon } from 'lucide-react';

export interface CartEmptyStateProps {
  browseHref?: string;
  onBrowseClick?: () => void;
  title?: string;
  description?: string;
  ctaText?: string;
}

export function CartEmptyState({
  browseHref = '/shop',
  onBrowseClick,
  title = 'Your cart is empty',
  description = 'Discover our products and add something special to your cart.',
  ctaText = 'Browse products',
}: CartEmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-linear-to-b from-muted/20 to-muted/5 p-10 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-muted/80">
        <PackageIcon className="text-muted-foreground size-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-[220px] text-sm leading-relaxed">
        {description}
      </p>
      <Button asChild variant="outline" size="lg" className="mt-6 min-h-12 rounded-xl px-6">
        <Link href={browseHref} onClick={onBrowseClick}>
          {ctaText}
          <ArrowRightIcon className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}
