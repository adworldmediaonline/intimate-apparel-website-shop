import WishlistArea from '@/components/version-tsx/wishlist/wishlist-area';
import Wrapper from '@/components/wrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intimate Apparel - Wishlist',
  alternates: {
    canonical: '/wishlist',
  },
};

export default function WishlistPage() {
  return (
    <div className="">
      <Wrapper>
        <WishlistArea />
      </Wrapper>
    </div>
  );
}
