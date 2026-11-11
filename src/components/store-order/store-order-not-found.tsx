'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Receipt } from 'lucide-react';
import Link from 'next/link';

/** Empty state when the order cannot be loaded or the id is invalid. */
export const StoreOrderNotFound = () => (
  <div className="py-8 lg:py-12">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Receipt className="w-10 h-10 text-muted-foreground" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Order not found
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We couldn&apos;t load an order for this link. Check the URL or use
            the link from your confirmation email. If you need help, our team
            can look it up for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/shop">
                Continue shopping
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/contact">
                Contact support
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
