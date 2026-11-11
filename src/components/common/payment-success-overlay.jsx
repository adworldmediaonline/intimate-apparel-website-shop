'use client';
import { useEffect, useState } from 'react';

const PaymentSuccessOverlay = ({ isVisible }) => {
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Animate checkmark after a brief delay
      const timer = setTimeout(() => setShowCheckmark(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowCheckmark(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-in zoom-in-95 duration-500">
        <div className="text-center">
          {/* Animated Success Icon with Ring */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            {/* Outer ring animation */}
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-75"></div>

            {/* Main circle */}
            <div className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
              {/* Checkmark with draw animation */}
              <svg
                className={`h-14 w-14 text-white transition-all duration-700 ${
                  showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline
                  points="20,6 9,17 4,12"
                  className="checkmark-path"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: showCheckmark ? 0 : 30,
                    transition: 'stroke-dashoffset 0.6s ease-in-out 0.2s'
                  }}
                ></polyline>
              </svg>
            </div>
          </div>

          {/* Success Message with slide-up animation */}
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your order has been confirmed
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to order details...
            </p>
          </div>

          {/* Animated progress indicator */}
          <div className="mt-6 flex justify-center items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessOverlay;
