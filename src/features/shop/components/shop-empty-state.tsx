'use client';

import { Button } from '@/components/ui/button';
import { Search, AlertCircle } from 'lucide-react';

interface ShopEmptyStateProps {
  variant: 'empty' | 'error';
  onReset?: () => void;
  message?: string | null;
}

const variantConfig = {
  empty: {
    title: 'No products found',
    description: 'Try adjusting your filters or search terms.',
    Icon: Search,
    buttonLabel: 'Clear All Filters',
  },
  error: {
    title: 'Error loading products',
    description: 'Something went wrong. Please try again.',
    Icon: AlertCircle,
    buttonLabel: 'Try Again',
  },
} as const;

const ShopEmptyState = ({ variant, onReset, message }: ShopEmptyStateProps) => {
  const config = variantConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-16 text-center">
      <config.Icon className="h-12 w-12 text-muted-foreground" />
      <div>
        <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
        <p className="text-sm text-muted-foreground">{message ?? config.description}</p>
      </div>
      {onReset ? (
        <Button onClick={onReset}>{config.buttonLabel}</Button>
      ) : null}
    </div>
  );
};

export default ShopEmptyState;

