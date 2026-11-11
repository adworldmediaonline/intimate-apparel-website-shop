'use client';

import { SheetTitle } from '@/components/ui/sheet';
import { ShoppingBagIcon } from 'lucide-react';

export interface CartDrawerHeaderProps {
  itemCount: number;
}

export function CartDrawerHeader({ itemCount }: CartDrawerHeaderProps) {
  return (
    <div className="border-b border-border/60 bg-linear-to-b from-muted/50 to-transparent px-5 pr-12 pt-5 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBagIcon className="size-5" />
        </div>
        <div>
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
            Your Cart
          </SheetTitle>
          <p className="text-muted-foreground text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>
    </div>
  );
}
