'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { StoreOrderDocument } from '@/types/store-order';
import { Clock, ExternalLink, Truck } from 'lucide-react';
import { getShippingCarriersFromDetails } from './store-order-utils';

interface StoreOrderShippingTrackCardProps {
  order: StoreOrderDocument;
}

export const StoreOrderShippingTrackCard = ({
  order,
}: StoreOrderShippingTrackCardProps) => {
  const status = order.status ?? '';
  // A booked parcel awaiting collection still has an AWB and a tracking
  // link, so this block belongs on screen for it too.
  const isShipped = ['shipped', 'pending_pickup'].includes(status.toLowerCase());
  const shippingDetails = order.shippingDetails;
  const shippingCarriers = getShippingCarriersFromDetails(shippingDetails);
  const trackingUrl = shippingDetails?.trackingUrl;
  const trackingNumber = shippingDetails?.trackingNumber;
  const carrier = shippingDetails?.carrier || 'Standard Shipping';

  const showProminentBlock =
    isShipped ||
    shippingCarriers.length > 0 ||
    Boolean(trackingUrl || trackingNumber);

  if (!showProminentBlock) return null;

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" aria-hidden />
          Shipping Information
          {shippingCarriers.length > 1 ? (
            <Badge variant="secondary" className="ml-2">
              {shippingCarriers.length} Packages
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {shippingCarriers.length > 0 ? (
          <div className="space-y-4">
            {shippingCarriers.map((carrierItem, index) => (
              <div
                key={index}
                className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-3"
              >
                {shippingCarriers.length > 1 ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Package {index + 1} of {shippingCarriers.length}
                    </Badge>
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-semibold text-foreground">
                        {carrierItem.carrier || 'Standard Shipping'}
                      </p>
                    </div>
                    {carrierItem.trackingNumber ? (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Tracking Number
                        </p>
                        <p className="font-mono text-sm text-foreground break-all">
                          {carrierItem.trackingNumber}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {carrierItem.trackingUrl ? (
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto shrink-0"
                    >
                      <a
                        href={carrierItem.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Track Package{' '}
                        {shippingCarriers.length > 1 ? index + 1 : ''}
                        <ExternalLink className="w-4 h-4" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                </div>

                {!carrierItem.trackingUrl && !carrierItem.trackingNumber ? (
                  <Alert className="mt-2">
                    <Clock className="h-4 w-4" aria-hidden />
                    <AlertDescription className="text-sm">
                      Tracking information will be available soon for this
                      package.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <>
            {trackingUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" aria-hidden />
                    Track Your Package
                  </h3>
                </div>
                <div className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-semibold text-foreground">{carrier}</p>
                      {trackingNumber ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Tracking Number
                          </p>
                          <p className="font-mono text-sm text-foreground">
                            {trackingNumber}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Track Order
                        <ExternalLink className="w-4 h-4" aria-hidden />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {!trackingUrl && trackingNumber ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" aria-hidden />
                    Tracking Information
                  </h3>
                </div>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-semibold text-foreground">{carrier}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tracking Number
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {trackingNumber}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
