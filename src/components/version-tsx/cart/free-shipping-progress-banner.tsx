'use client';

import { TruckIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CURRENCY_SYMBOL } from '@/lib/brand';

export interface FreeShippingProgressBannerProps {
  progressPercent: number;
  gapToFreeShipping: number;
  currencySymbol?: string;
}

function getProgressMessage(percent: number): string {
  if (percent >= 80) return 'So close!';
  if (percent >= 50) return "You're almost there!";
  return 'Unlock free shipping';
}

export function FreeShippingProgressBanner({
  progressPercent,
  gapToFreeShipping,
  currencySymbol = CURRENCY_SYMBOL,
}: FreeShippingProgressBannerProps) {
  return (
    <div className="rounded-xl border border-primary/25 bg-linear-to-br from-primary/10 to-primary/5 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20">
          <TruckIcon className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            {getProgressMessage(progressPercent)}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Add {currencySymbol}{gapToFreeShipping} more for free shipping
          </p>
        </div>
      </div>
      <Progress value={Math.min(100, progressPercent)} className="mt-3 h-2" />
    </div>
  );
}
