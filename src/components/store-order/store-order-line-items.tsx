'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StoreOrderCartItem } from '@/types/store-order';
import { Package } from 'lucide-react';
import Image from 'next/image';

interface StoreOrderLineItemsProps {
  cart: StoreOrderCartItem[];
}

export const StoreOrderLineItems = ({ cart }: StoreOrderLineItemsProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" aria-hidden />
        Order Items
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {cart.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
          >
            <div className="w-16 h-16 shrink-0 relative">
              {item.img ? (
                <Image
                  src={item.img}
                  alt={item.title ?? 'Product'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div
                  className="w-full h-full rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  aria-hidden
                >
                  —
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                {item.title ?? 'Item'}
              </h3>
              {item.selectedOption ? (
                <p className="text-xs text-muted-foreground">
                  {item.selectedOption.title} (+
                  {CURRENCY_SYMBOL}{Number(item.selectedOption.price).toFixed(2)})
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Quantity: {item.orderQuantity ?? 1}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-foreground">
                ₹
                {(
                  Number(item.finalPriceDiscount ?? 0) *
                  (item.orderQuantity ?? 1)
                ).toFixed(2)}
              </div>
              {(item.orderQuantity ?? 1) > 1 ? (
                <div className="text-xs text-muted-foreground">
                  {CURRENCY_SYMBOL}{Number(item.finalPriceDiscount ?? 0).toFixed(2)} each
                </div>
              ) : null}
            </div>
          </div>
        ))}

      </div>
    </CardContent>
  </Card>
);
