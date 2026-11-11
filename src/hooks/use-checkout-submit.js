'use client';
import { BRAND_NAME, COMMERCE_COUNTRY, theme } from '@/lib/brand';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, hideCartConfirmation } from '@/redux/features/cartSlice';
import {
  useCalculateTaxMutation,
  useCreateRazorpayOrderMutation,
  useSaveOrderMutation,
} from '@/redux/features/order/orderApi';
import {
  begin_checkout_submission,
  end_checkout_submission,
  set_shipping,
  set_tax_preview,
} from '@/redux/features/order/orderSlice';
import { notifyError } from '@/utils/toast';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import { isOutOfStock, getConfigOptionAvailableQuantity } from '@/lib/product-stock';
import { getOrCreateShopCartIntentSessionKey } from '@/lib/shop-cart-intent/session-key';
import { markOrderPaidInSession } from '@/components/store-order/confirmation-access-guard';
import {
  toAnalyticsItem,
  trackAddPaymentInfo,
  trackBeginCheckout,
} from '@/lib/analytics';

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Load Razorpay Checkout once; resolves true when window.Razorpay is ready. */
const loadRazorpayCheckout = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);
    const script = existing || document.createElement('script');
    script.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
    script.addEventListener('error', () => resolve(false));
    if (!existing) {
      script.src = RAZORPAY_CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });

/** Parse saveOrder error for stock validation (400 + invalidItems). */
const getSaveOrderErrorMessage = (error) => {
  const data = error?.data ?? error?.response?.data;
  const status = error?.status ?? error?.response?.status;
  if (status === 400 && data?.invalidItems && Array.isArray(data.invalidItems) && data.invalidItems.length > 0) {
    const items = data.invalidItems.map((i) => i.title || i.productId).filter(Boolean);
    const detail = items.length > 0 ? ` (${items.join(', ')})` : '';
    return `Some items in your cart are no longer available. Please remove them and try again.${detail}`;
  }
  return data?.message || 'Something went wrong with your order. Please try again.';
};

const getDisplayCouponCode = code =>
  String(code || '').startsWith('checkout-promo:') ? 'Checkout promo' : code;

import { authClient } from '../lib/authClient';
import useCartInfo from './use-cart-info';
import { useCartSummary } from './use-cart-summary';
import { useBogo } from './use-bogo';

/**
 * A finished checkout should leave nothing behind: the half-typed address
 * and the begin_checkout guard both belong to the attempt that just ended.
 */
const clearCheckoutSession = () => {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem('uwh_checkout_draft');
    window.sessionStorage.removeItem('uwh_began_checkout');
  } catch {
    /* storage unavailable; nothing to clean */
  }
};

const useCheckoutSubmit = () => {
  const { data: session } = authClient.useSession();

  const [saveOrder] = useSaveOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [calculateTax, { isLoading: isTaxLoading }] = useCalculateTaxMutation();
  const [fetchProduct] = useLazyGetProductQuery();
  const { cart_products, couponCode, discountAmount } = useSelector(state => state.cart);

  const { tax_preview } = useSelector(state => state.order);
  const { total, setTotal } = useCartInfo();
  const { displayTotal, effectiveShippingCost } =
    useCartSummary();
  // The running buy-N-get-M offer, priced by the server. The checkout total
  // has to carry it or the page quotes one figure and the backend charges
  // another — the backend applies the offer whether or not we show it.
  const bogo = useBogo();

  const [cartTotal, setCartTotal] = useState('');
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  // begin_checkout fires once, when the page first has a cart to report —
  // not on every re-render, and not on an empty cart mid-hydration.
  const beganCheckoutRef = useRef(false);
  // The payment method the shopper last had selected when add_payment_info was
  // reported, so flipping between options does not report each one twice.
  const reportedPaymentRef = useRef(null);
  const [orderDataForModal, setOrderDataForModal] = useState({});

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    // Lets the multi-step checkout validate the billing fields before
    // moving to payment, without submitting anything.
    trigger,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    shouldUnregister: true,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      country: COMMERCE_COUNTRY,
      state: '',
      zipCode: '',
      contactNo: '',
      sameAsBillingAddress: true,
      shippingFirstName: '',
      shippingLastName: '',
      shippingAddress: '',
      shippingCity: '',
      shippingCountry: COMMERCE_COUNTRY,
      shippingState: '',
      shippingZipCode: '',
      shippingContactNo: '',
    },
  });

  const taxDebounceRef = useRef(null);

  const address = watch('address');
  const city = watch('city');
  const stateVal = watch('state');
  const zipCode = watch('zipCode');
  const country = watch('country');
  const sameAsBillingAddress = watch('sameAsBillingAddress');
  const shippingAddressValue = watch('shippingAddress');
  const shippingCity = watch('shippingCity');
  const shippingState = watch('shippingState');
  const shippingZipCode = watch('shippingZipCode');
  const shippingCountry = watch('shippingCountry');

  const taxAddress = useMemo(
    () =>
      sameAsBillingAddress
        ? {
          address,
          city,
          state: stateVal,
          zipCode,
          country,
        }
        : {
          address: shippingAddressValue,
          city: shippingCity,
          state: shippingState,
          zipCode: shippingZipCode,
          country: shippingCountry,
        },
    [
      address,
      city,
      country,
      sameAsBillingAddress,
      shippingAddressValue,
      shippingCity,
      shippingCountry,
      shippingState,
      shippingZipCode,
      stateVal,
      zipCode,
    ]
  );

  /**
   * Whatever customer identity is available right now — the signed-in session
   * first, then whatever has been typed into the checkout form. Meta uses
   * these for advanced matching, and match quality is what makes a conversion
   * attributable. Empty fields are dropped by the analytics layer, so an
   * anonymous shopper simply sends less rather than sending blanks.
   */
  const currentCustomer = () => {
    const v = typeof watch === 'function' ? watch() : {};
    const first = v.firstName || session?.user?.name?.split(' ')[0];
    const last =
      v.lastName || session?.user?.name?.split(' ').slice(1).join(' ');
    return {
      email: v.email || session?.user?.email,
      phone: v.contactNo,
      firstName: first,
      lastName: last,
      city: v.city,
      state: v.state,
      zip: v.zipCode,
      country: v.country,
    };
  };

  /**
   * begin_checkout — once, as soon as the checkout page has a cart.
   * add_payment_info — whenever the shopper settles on a payment method.
   * Both report the cart as it stands; the server remains the authority on
   * what is actually charged.
   */
  useEffect(() => {
    if (beganCheckoutRef.current || !cart_products?.length) return;
    /**
     * Once per checkout, not once per page.
     *
     * The checkout is three routes now, so this hook mounts three times and
     * the ref above resets with it — which reported begin_checkout once per
     * step and tripled the top of the funnel. sessionStorage spans the
     * steps; it is cleared when the order is placed, so a later second
     * checkout reports properly.
     */
    try {
      if (typeof window !== 'undefined') {
        if (window.sessionStorage.getItem('uwh_began_checkout')) {
          beganCheckoutRef.current = true;
          return;
        }
        window.sessionStorage.setItem('uwh_began_checkout', '1');
      }
    } catch {
      // Storage unavailable — an occasional duplicate beats losing the event.
    }
    beganCheckoutRef.current = true;
    trackBeginCheckout(
      cart_products.map(line => toAnalyticsItem(line)),
      Number(cartTotal) || undefined,
      currentCustomer()
    );
  }, [cart_products, cartTotal]);

  const addressKey = `${taxAddress.address?.trim() || ''}|${taxAddress.city?.trim() || ''}|${taxAddress.state?.trim() || ''}|${taxAddress.zipCode?.trim() || ''}|${taxAddress.country?.trim() || ''}`;

  useEffect(() => {
    const hasCompleteAddress =
      taxAddress.address?.trim() &&
      taxAddress.city?.trim() &&
      taxAddress.state?.trim() &&
      taxAddress.zipCode?.trim() &&
      taxAddress.country?.trim();

    if (
      !hasCompleteAddress ||
      !cart_products?.length ||
      isCheckoutSubmit ||
      processingPayment
    ) {
      dispatch(set_tax_preview(null));
      return;
    }

    if (taxDebounceRef.current) {
      clearTimeout(taxDebounceRef.current);
    }

    taxDebounceRef.current = setTimeout(() => {
      calculateTax({
        cart: cart_products,
        orderData: {
          address: taxAddress.address?.trim(),
          city: taxAddress.city?.trim(),
          state: taxAddress.state?.trim(),
          zipCode: taxAddress.zipCode?.trim(),
          country: taxAddress.country?.trim(),
          shippingCost: Number(effectiveShippingCost) || 0,
          discountAmount: Number(discountAmount ?? 0) || 0,
        },
      }).catch(() => {
        dispatch(set_tax_preview(null));
      });
      taxDebounceRef.current = null;
    }, 500);

    return () => {
      if (taxDebounceRef.current) {
        clearTimeout(taxDebounceRef.current);
      }
    };
  }, [
    addressKey,
    taxAddress,
    cart_products,
    isCheckoutSubmit,
    processingPayment,
    calculateTax,
    dispatch,
    effectiveShippingCost,
    discountAmount,
  ]);

  useEffect(() => {
    return () => {
      dispatch(set_tax_preview(null));
    };
  }, [dispatch]);

  useEffect(() => {
    setCartTotal(
      Math.max(0, Number(displayTotal) - Number(bogo.discount || 0)).toFixed(2)
    );
  }, [displayTotal, bogo.discount]);

  const calculateTotals = () => {
    if (
      !cart_products ||
      !Array.isArray(cart_products) ||
      cart_products.length === 0
    ) {
      return {
        cartSubtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
      };
    }

    try {
      const cartSubtotal = cart_products.reduce((sum, item) => {
        const quantity = Number(item?.orderQuantity || 0);
        const unitPrice = Number(item?.finalPriceDiscount ?? 0);
        if (isNaN(quantity) || isNaN(unitPrice)) return sum;
        return sum + quantity * unitPrice;
      }, 0);

      return {
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
        totalDiscount: 0,
        finalTotal: Math.round(cartSubtotal * 100) / 100,
      };
    } catch (error) {
      return {
        cartSubtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
      };
    }
  };

  const getCheckoutValidationMessage = data => {
    if (
      !data.firstName ||
      !data.lastName ||
      !data.address ||
      !data.city ||
      !data.country ||
      !data.state ||
      !data.zipCode
    ) {
      return 'Please fill in all required fields';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email || '').trim())) {
      return 'Please enter a valid email address';
    }

    if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(String(data.contactNo || '').replace(/[\s-]/g, ''))) {
      return 'Please enter a valid 10-digit mobile number';
    }

    if (
      !data.sameAsBillingAddress &&
      (!data.shippingFirstName ||
        !data.shippingLastName ||
        !data.shippingAddress ||
        !data.shippingCity ||
        !data.shippingCountry ||
        !data.shippingState ||
        !data.shippingZipCode)
    ) {
      return 'Please fill in all required shipping address fields';
    }

    return '';
  };

  const validateCartStockForCheckout = async () => {
    if (!cart_products?.length) {
      notifyError('Please add products to cart first');
      return false;
    }

    const invalidItems = [];
    for (const item of cart_products) {
      const productId = item._id || item.productId || item.product?._id;
      if (!productId) continue;
      try {
        const result = await fetchProduct(productId);
        if (result.error || !result.data) {
          invalidItems.push({ title: item.title || 'Unknown product' });
          continue;
        }
        const freshProduct = result.data;
        if (isOutOfStock(freshProduct)) {
          invalidItems.push({
            title: item.title || freshProduct?.title || 'Unknown product',
          });
          continue;
        }
        const configOptionQty = getConfigOptionAvailableQuantity(
          freshProduct,
          item.selectedConfigurations
        );
        const availableQty =
          configOptionQty != null
            ? configOptionQty
            : Number(freshProduct?.quantity ?? 0);
        const requestedQty = Number(item.orderQuantity ?? 1);
        if (availableQty < requestedQty) {
          invalidItems.push({
            title: item.title || freshProduct?.title || 'Unknown product',
            available: availableQty,
            requested: requestedQty,
          });
        }
      } catch {
        invalidItems.push({ title: item.title || 'Unknown product' });
      }
    }

    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map((i) => i.title).filter(Boolean);
      const detail = itemNames.length > 0 ? ` (${itemNames.join(', ')})` : '';
      notifyError(
        `Some items in your cart are no longer available. Please remove them and try again.${detail}`
      );
      return false;
    }

    return true;
  };

  const buildOrderInfoFromData = (data, paymentMethod) => {
    const billingAddress = {
      firstName: data.firstName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email?.trim() || '',
      contact: data.contactNo?.trim() || '',
      address: data.address?.trim() || '',
      city: data.city?.trim() || '',
      country: data.country?.trim() || '',
      state: data.state?.trim() || '',
      zipCode: data.zipCode?.trim() || '',
    };
    const shippingAddress = data.sameAsBillingAddress
      ? { ...billingAddress }
      : {
        firstName: data.shippingFirstName?.trim() || '',
        lastName: data.shippingLastName?.trim() || '',
        name: `${data.shippingFirstName || ''} ${data.shippingLastName || ''}`.trim(),
        email: data.email?.trim() || '',
        contact: data.shippingContactNo?.trim() || '',
        address: data.shippingAddress?.trim() || '',
        city: data.shippingCity?.trim() || '',
        country: data.shippingCountry?.trim() || '',
        state: data.shippingState?.trim() || '',
        zipCode: data.shippingZipCode?.trim() || '',
      };
    const newShippingInfo = {
      ...data,
      shippingOption: 'Free',
      name: billingAddress.name,
      billingAddress,
      shippingAddress,
    };
    const rawSubTotal =
      cart_products?.reduce(
        (acc, item) => acc + Number(item.finalPriceDiscount || item.price || 0) * item.orderQuantity,
        0
      ) || 0;
    const displayCouponCode = getDisplayCouponCode(couponCode);

    return {
      newShippingInfo,
      orderInfo: {
        cart: cart_products?.map(item => {
          const {
            createdAt,
            updatedAt,
            reviews,
            __v,
            sellCount,
            ...otherProperties
          } = item;

          return otherProperties;
        }),
        subTotal: rawSubTotal,
        // Display total; the backend recomputes the authoritative charge from the cart.
        totalAmount: Math.max(0, Number(cartTotal) || 0),
        discount: discountAmount ?? 0,
        shippingCost: Number(effectiveShippingCost) || 0,
        discountAmount: Number(discountAmount ?? 0) || 0,
        ...(couponCode && discountAmount > 0 && {
          appliedCoupon: {
            couponCode: displayCouponCode,
            discountAmount,
            discount: discountAmount,
          },
        }),
        ...(tax_preview?.taxCollected && {
          taxAmount: Number(tax_preview.tax || 0) / 100,
          taxCalculationId: tax_preview.calculationId,
          taxCollected: true,
        }),
        name: shippingAddress.name || billingAddress.name,
        email: billingAddress.email,
        address: shippingAddress.address,
        contact: shippingAddress.contact || billingAddress.contact,
        city: shippingAddress.city,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode,
        state: shippingAddress.state,
        sameAsBillingAddress: Boolean(data.sameAsBillingAddress),
        billingAddress,
        shippingAddress,
        user: session?.user?.id,
        shopCartIntentSessionKey: getOrCreateShopCartIntentSessionKey(),
        paymentMethod,
        ...(newShippingInfo.orderNote && { orderNote: newShippingInfo.orderNote.trim() }),
      },
    };
  };

  /**
   * The only way into the confirmation page. It stamps the session so the
   * guard there lets this tab through — every other route to that URL is
   * bounced to tracking — and then navigates.
   */
  const goToConfirmation = orderId => {
    if (!orderId) {
      router.push('/');
      return;
    }
    markOrderPaidInSession(orderId);
    router.push(`/confirmation/${encodeURIComponent(orderId)}`);
  };

  /** After an order is saved: clear the cart and go to the confirmation page. */
  const finishPaidOrder = savedOrder => {
    const orderId =
      savedOrder?.order?._id ||
      savedOrder?.order?.invoice ||
      savedOrder?.data?.order?._id ||
      savedOrder?.data?.order?.invoice;

    localStorage.removeItem('cart_products');
    localStorage.removeItem('shipping_info');
    dispatch(clearCart());
    dispatch(hideCartConfirmation());

    setTimeout(() => {
      setPaymentSuccessful(false);
      goToConfirmation(orderId);
    }, 1200);
  };

  const resetCheckoutState = () => {
    setIsCheckoutSubmit(false);
    setProcessingPayment(false);
    dispatch(end_checkout_submission());
  };

  /** Shared pre-payment checks; returns orderInfo or null (after notifying). */
  const prepareOrder = async (data, paymentMethod) => {
    const validationMessage = getCheckoutValidationMessage(data);
    if (validationMessage) {
      notifyError(validationMessage);
      return null;
    }
    if (!(await validateCartStockForCheckout())) return null;
    const { newShippingInfo, orderInfo } = buildOrderInfoFromData(data, paymentMethod);
    dispatch(set_shipping(newShippingInfo));
    return orderInfo;
  };

  /**
   * Razorpay (UPI / cards / netbanking / wallets): create order → Checkout
   * modal → verify + save on the server.
   *
   * `partial` runs the identical flow against a smaller charge: the server
   * works out the advance from its own total, bills that, and records the
   * balance as due on delivery. Nothing about the split is sent from here.
   */
  const handleRazorpayCheckout = async (data, { partial = false } = {}) => {
    setIsCheckoutSubmit(true);
    setProcessingPayment(true);
    dispatch(begin_checkout_submission());

    try {
      const orderInfo = await prepareOrder(data, partial ? 'Partial' : 'Razorpay');
      if (!orderInfo) return resetCheckoutState();

      // 100% discount: nothing to charge. The server re-checks that its own total is 0.
      if (Number(orderInfo.totalAmount) <= 0) {
        clearCheckoutSession();
        setPaymentSuccessful(true);
        const savedOrder = await saveOrder({
          ...orderInfo,
          paymentMethod: 'Free Order (100% Discount)',
        }).unwrap();
        finishPaidOrder(savedOrder);
        return resetCheckoutState();
      }

      const [rzpOrder, loaded] = await Promise.all([
        createRazorpayOrder({
          orderData: partial ? { ...orderInfo, paymentMode: 'partial' } : orderInfo,
        }).unwrap(),
        loadRazorpayCheckout(),
      ]);
      if (!loaded) {
        throw new Error('Could not load Razorpay. Check your connection and try again.');
      }
      if (!rzpOrder?.orderId || !rzpOrder?.keyId) {
        throw new Error('Razorpay did not return an order');
      }

      const checkout = new window.Razorpay({
        key: rzpOrder.keyId,
        order_id: rzpOrder.orderId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: BRAND_NAME,
        description: partial
          ? `${BRAND_NAME} order — advance payment`
          : `${BRAND_NAME} order`,
        prefill: {
          name: orderInfo.billingAddress?.name,
          email: orderInfo.email,
          contact: orderInfo.billingAddress?.contact,
        },
        theme: { color: theme?.primary },
        handler: async response => {
          try {
            clearCheckoutSession();
        setPaymentSuccessful(true);
            const savedOrder = await saveOrder({
              ...orderInfo,
              paymentMethod: partial ? 'Partial' : 'Razorpay',
              paymentInfo: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            }).unwrap();
            finishPaidOrder(savedOrder);
          } catch (error) {
            setPaymentSuccessful(false);
            notifyError(getSaveOrderErrorMessage(error));
          } finally {
            resetCheckoutState();
          }
        },
        modal: { ondismiss: resetCheckoutState },
      });
      checkout.on('payment.failed', event => {
        notifyError(event?.error?.description || 'Payment failed. Please try again.');
      });
      checkout.open();
    } catch (error) {
      setPaymentSuccessful(false);
      resetCheckoutState();
      notifyError(
        error?.data?.invalidItems
          ? getSaveOrderErrorMessage(error)
          : error?.data?.message ||
            error?.message ||
            'Unable to start Razorpay checkout. Please try again.'
      );
    }
  };

  /** Cash on Delivery: no gateway — the server derives the total and saves a
   *  pending order. Only reachable when an admin has switched COD on in the
   *  payment settings; the server refuses it otherwise. */
  const handleCodCheckout = async data => {
    setIsCheckoutSubmit(true);
    setProcessingPayment(true);
    dispatch(begin_checkout_submission());
    try {
      const orderInfo = await prepareOrder(data, 'COD');
      if (!orderInfo) return resetCheckoutState();
      clearCheckoutSession();
        setPaymentSuccessful(true);
      const savedOrder = await saveOrder({ ...orderInfo, paymentMethod: 'COD' }).unwrap();
      finishPaidOrder(savedOrder);
      resetCheckoutState();
    } catch (error) {
      setPaymentSuccessful(false);
      resetCheckoutState();
      notifyError(getSaveOrderErrorMessage(error));
    }
  };

  // Checkout methods, each switchable from the admin payment settings:
  // Razorpay in full, a part payment (advance online, balance in cash), or
  // plain Cash on Delivery.
  const submitHandler = data => {
    /**
     * add_payment_info belongs here, not on a selection change. Firing it when
     * the radio changed meant it went out on mount for the default method and
     * again on every toggle — several hits per checkout, none of which was a
     * commitment. Submitting is the commitment, and it reports the method
     * actually used. Once per attempt, guarded in case of a double-click.
     */
    if (!reportedPaymentRef.current) {
      reportedPaymentRef.current = selectedPaymentMethod;
      const label =
        selectedPaymentMethod === 'cod'
          ? 'Cash on Delivery'
          : selectedPaymentMethod === 'partial'
            ? 'Part payment'
            : 'Razorpay';
      trackAddPaymentInfo(
        (cart_products ?? []).map(line => toAnalyticsItem(line)),
        label,
        Number(cartTotal) || undefined,
        currentCustomer()
      );
    }

    if (selectedPaymentMethod === 'cod') return handleCodCheckout(data);
    if (selectedPaymentMethod === 'partial') {
      return handleRazorpayCheckout(data, { partial: true });
    }
    return handleRazorpayCheckout(data);
  };

  const handleThankYouModalClose = () => {
    setShowThankYouModal(false);
  };

  const handleThankYouModalContinue = () => {
    setShowThankYouModal(false);

    goToConfirmation(orderDataForModal?.orderId);
  };

  return {
    handleSubmit,
    submitHandler,
    register,
    errors,
    setValue,
    watch,
    trigger,
    total,
    cartTotal,
    bogo,
    isCheckoutSubmit,
    setTotal,
    control,
    processingPayment,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentSuccessful,
    calculateTotals,
    tax_preview,
    isTaxLoading,
    showThankYouModal,
    orderDataForModal,
    handleThankYouModalClose,
    handleThankYouModalContinue,
  };
};

export default useCheckoutSubmit;
