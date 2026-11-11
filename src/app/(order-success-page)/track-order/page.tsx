import type { Metadata } from 'next';
import TrackOrderLookup from '@/components/store-order/track-order-lookup';

export const metadata: Metadata = {
  title: 'Track your order',
  description:
    'Enter your order number and the mobile number used on the order to see where your parcel is.',
  // A tracking form has nothing to index and should never rank.
  robots: { index: false, follow: false },
};

export default function TrackOrderLandingPage() {
  return <TrackOrderLookup />;
}
