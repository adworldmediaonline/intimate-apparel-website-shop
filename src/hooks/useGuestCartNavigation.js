'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

export default function useGuestCartNavigation() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector(state => state.auth);
  const { cart_products } = useSelector(state => state.cart);

  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/email-verify') ||
    pathname.includes('/forgot') ||
    pathname.includes('/forget-password');

  const navigateToCart = () => {
    router.push('/cart');
    return;
  };

  const navigateToCheckout = () => {
    router.push('/checkout');
    return;
  };

  return {
    navigateToCart,
    navigateToCheckout,
    isAuthenticated: !!user,
    hasCartItems: cart_products.length > 0,
  };
}
