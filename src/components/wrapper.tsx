'use client';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { AddToCartAnimationProvider } from '@/context/add-to-cart-animation-context';
import CartConfirmationModal from '@/components/modals/cart-confirmation-modal';
import { useCouponAutoApply } from '@/hooks/use-coupon-auto-apply';
import { useCouponRevalidation } from '@/hooks/use-coupon-revalidation';

import {
  get_applied_coupon,
  get_cart_products,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { get_compare_products } from '@/redux/features/compareSlice';
import { get_wishlist_products } from '@/redux/features/wishlist-slice';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useCouponAutoApply();
  // An applied coupon has to follow the cart: see the hook for why.
  useCouponRevalidation();

  useEffect(() => {
    // Defer Redux initialization to reduce Total Blocking Time
    // Use requestIdleCallback to load after initial paint, or fallback to setTimeout
    const initializeRedux = () => {
      if (!hasInitialized.current) {
        dispatch(get_cart_products());
        // Restore the coupon too: a step change is a real navigation now.
        dispatch(get_applied_coupon());
        dispatch(get_wishlist_products());
        dispatch(get_compare_products());
        dispatch(initialOrderQuantity());
        hasInitialized.current = true;
      }
    };

    // Use requestIdleCallback if available (runs when browser is idle)
    // Fallback to setTimeout for browsers that don't support it
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(initializeRedux, { timeout: 500 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback: defer to after first paint (100ms delay)
      const timeoutId = setTimeout(initializeRedux, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch]);

  return (
    <AddToCartAnimationProvider>
      <div id="wrapper">
        {children}
        <CartConfirmationModal />
      </div>
    </AddToCartAnimationProvider>
  );
};

export default Wrapper;
