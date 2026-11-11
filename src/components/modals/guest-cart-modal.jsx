'use client';
const styles = new Proxy({}, { get: () => '' });
import { useSaveGuestCartMutation } from '@/redux/features/cart/cartApi';
import {
  hideGuestCartModal,
  setGuestEmail,
} from '@/redux/features/guestCart/guestCartSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function GuestCartModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { showModal } = useSelector(state => state.guestCart);
  const { cart_products } = useSelector(state => state.cart);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // RTK Query mutation
  const [saveGuestCart, { isLoading, error }] = useSaveGuestCartMutation();

  // Don't show modal on auth pages (login, register, etc.)
  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/email-verify') ||
    pathname.includes('/forgot') ||
    pathname.includes('/forget-password');

  // If we're on an auth page, don't render the modal even if showModal is true
  if (isAuthPage) {
    return null;
  }

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = e => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleContinueAsGuest = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (cart_products.length === 0) {
      notifyError('Your cart is empty');
      return;
    }

    try {
      // Save cart using RTK Query
      const result = await saveGuestCart({
        email,
        cartItems: cart_products,
      }).unwrap();

      // Store email for checkout process
      dispatch(setGuestEmail(email));
      localStorage.setItem('guestEmail', email);

      dispatch(hideGuestCartModal());
      notifySuccess('Cart saved! Redirecting to checkout...');

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to save cart';
      setEmailError(errorMessage);
      notifyError(`${errorMessage}. Please try again.`);
    }
  };

  const handleViewCart = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (cart_products.length === 0) {
      notifyError('Your cart is empty');
      return;
    }

    try {
      // Save cart using RTK Query (same API call as continue to checkout)
      const result = await saveGuestCart({
        email,
        cartItems: cart_products,
      }).unwrap();

      // Store email for future use
      dispatch(setGuestEmail(email));
      localStorage.setItem('guestEmail', email);

      dispatch(hideGuestCartModal());
      notifySuccess('Cart saved! Redirecting to cart...');

      // Redirect to cart page
      router.push('/cart');
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to save cart';
      setEmailError(errorMessage);
      notifyError(`${errorMessage}. Please try again.`);
    }
  };

  const handleSignIn = () => {
    dispatch(hideGuestCartModal());
    router.push('/login?redirect=/checkout');
  };

  const handleClose = () => {
    dispatch(hideGuestCartModal());
    setEmail('');
    setEmailError('');
  };

  if (!showModal) return null;

  return (
    <div className="" onClick={handleClose}>
      <div className="" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="">
          <h2 className="">Choose Your Option</h2>
        </div>

        {/* Content */}
        <div className="">
          {/* Continue as Guest Option */}
          <div className="">
            <h3 className="">Continue as Guest</h3>
            <p className="">
              Enter your email to save your cart and proceed to checkout.
            </p>

            <div className="">
              <div className="">
                <input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className={` ${emailError ? styles.inputError : ''}`}
                  disabled={isLoading}
                />
                {emailError && <span className="">{emailError}</span>}
              </div>

              {error && (
                <div className="">
                  {error?.data?.message ||
                    error?.message ||
                    'An error occurred'}
                </div>
              )}

              <div className="">
                <button
                  onClick={handleViewCart}
                  disabled={isLoading || !email.trim()}
                  className=""
                >
                  {isLoading ? (
                    <span className="">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
                          className=""
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'View Cart'
                  )}
                </button>

                <button
                  onClick={handleContinueAsGuest}
                  disabled={isLoading || !email.trim()}
                  className=""
                >
                  {isLoading ? (
                    <span className="">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
                          className=""
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Continue to Checkout'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="">
            <span className="">or</span>
          </div>

          {/* Sign In Option */}
          <div className="">
            <h3 className="">Sign In</h3>
            <p className="">
              Access your account for faster checkout and order history.
            </p>

            <button onClick={handleSignIn} className="">
              Sign In to Your Account
            </button>

            <p className="">
              Don't have an account?{' '}
              <Link href="/register?redirect=/checkout" className="">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
