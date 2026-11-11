import {
  useTrackAddToCartMutation,
  useTrackCartActionMutation,
  useTrackConversionMutation,
} from '@/redux/features/cart/cartTrackingApi';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useCartTracking = () => {
  const [sessionId, setSessionId] = useState(null);

  // RTK Query mutations
  const [trackAddToCartMutation, { isLoading: isTrackingAddToCart }] =
    useTrackAddToCartMutation();
  const [trackCartActionMutation, { isLoading: isTrackingCartAction }] =
    useTrackCartActionMutation();
  const [trackConversionMutation, { isLoading: isTrackingConversion }] =
    useTrackConversionMutation();

  // Get user and cart data from Redux store
  const { user } = useSelector(state => state.auth || {});
  const { cart_products } = useSelector(state => state.cart || {});

  // Generate or get session ID
  useEffect(() => {
    const getSessionId = () => {
      let storedSessionId = localStorage.getItem('cart_tracking_session');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem('cart_tracking_session', storedSessionId);
      }
      return storedSessionId;
    };

    setSessionId(getSessionId());
  }, []);

  // Reset page load time tracking
  const resetPageLoadTime = useCallback(() => {
    window.pageStartTime = Date.now();
  }, []);

  // Helper function to get cart total value
  const getCartTotalValue = useCallback(() => {
    if (cart_products && cart_products.length > 0) {
      return cart_products.reduce(
        (total, item) => total + item.price * item.orderQuantity,
        0
      );
    }
    return 0;
  }, [cart_products]);

  // Helper function to get cart items count
  const getCartItemsCount = useCallback(() => {
    if (cart_products && cart_products.length > 0) {
      return cart_products.reduce(
        (count, item) => count + item.orderQuantity,
        0
      );
    }
    return 0;
  }, [cart_products]);

  // Track add to cart event
  const trackAddToCart = useCallback(
    async (product, quantityOrOptions = 1, source = 'product-page') => {
      if (!sessionId || !product) {
        return null;
      }

      try {
        // Handle if second parameter is an object (options) or a number (quantity)
        let options = {};
        let quantity = 1;

        if (
          typeof quantityOrOptions === 'object' &&
          quantityOrOptions !== null
        ) {
          options = quantityOrOptions;
          quantity = options.quantity || 1;
          source = options.source || source;
        } else {
          quantity = quantityOrOptions || 1;
        }

        const trackingData = {
          productId: product._id,
          quantity: quantity,
          sessionId: sessionId,
          userId: user?.id || null,
          userEmail: user?.email || null,
          source: source,
          cartTotalValue: getCartTotalValue(),
          cartItemsCount: getCartItemsCount(),
          timeOnProductPage: window.pageStartTime
            ? Math.floor((Date.now() - window.pageStartTime) / 1000)
            : 0,
          ...options, // Include any additional options
        };

        const result = await trackAddToCartMutation(trackingData).unwrap();

        return result;
      } catch (error) {
        return null;
      }
    },
    [
      sessionId,
      user,
      getCartTotalValue,
      getCartItemsCount,
      trackAddToCartMutation,
    ]
  );

  // Track cart actions (remove, update quantity, etc.)
  const trackCartAction = useCallback(
    async (action, data = {}) => {
      if (!sessionId) return null;

      try {
        const trackingData = {
          action,
          sessionId,
          userId: user?.id || null,
          userEmail: user?.email || null,
          cartTotalValue: getCartTotalValue(),
          cartItemsCount: getCartItemsCount(),
          ...data,
        };

        const result = await trackCartActionMutation(trackingData).unwrap();

        return result;
      } catch (error) {
        return null;
      }
    },
    [
      sessionId,
      user,
      getCartTotalValue,
      getCartItemsCount,
      trackCartActionMutation,
    ]
  );

  // Track conversion when order is placed
  const trackConversion = useCallback(
    async orderId => {
      if (!sessionId || !orderId) return null;

      try {
        const conversionData = {
          userId: user?.id || null,
          userEmail: user?.email || null,
          sessionId: sessionId,
          orderId: orderId,
        };

        const result = await trackConversionMutation(conversionData).unwrap();

        return result;
      } catch (error) {
        return null;
      }
    },
    [sessionId, user, trackConversionMutation]
  );

  // Safe tracking wrapper that doesn't throw errors
  const trackAddToCartSafely = useCallback(
    async (product, quantity, source) => {
      try {
        return await trackAddToCart(product, quantity, source);
      } catch (error) {
        return null;
      }
    },
    [trackAddToCart]
  );

  return {
    // Core tracking functions
    trackAddToCart,
    trackCartAction,
    trackConversion,
    trackAddToCartSafely,
    resetPageLoadTime,

    // State
    sessionId,
    isLoading:
      isTrackingAddToCart || isTrackingCartAction || isTrackingConversion,

    // Helper data
    cartTotalValue: getCartTotalValue(),
    cartItemsCount: getCartItemsCount(),

    // User info
    isAuthenticated: !!user,
    userId: user?.id || null,
    userEmail: user?.email || null,
  };
};

export default useCartTracking;
