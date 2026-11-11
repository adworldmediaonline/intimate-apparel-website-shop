import CartArea from '@/components/version-tsx/cart-area';
import Wrapper from '@/components/wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intimate Apparel - Shopping Cart',
  alternates: {
    canonical: '/cart',
  },
};

export default function CartPage() {
  return (
    <Wrapper>
      <CartArea />
    </Wrapper>
  );
}
