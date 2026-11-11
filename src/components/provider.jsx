'use client';
import store from '@/redux/store';
import { Provider } from 'react-redux';
import { AuthDialogProvider } from '@/context/auth-dialog-context';

/**
 * Root providers. Razorpay Checkout is loaded on demand when the customer pays.
 */
const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthDialogProvider>{children}</AuthDialogProvider>
    </Provider>
  );
};

export default Providers;
