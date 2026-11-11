'use client';

const ThankYouModal = ({ isOpen, onClose, orderData = {}, onContinue }) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleContinue}
      >
        <div
          className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          {/* Main Content */}
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <div className="h-12 w-12 text-green-600">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
            </div>

            {/* Thank You Message */}
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Thank you for your purchase
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-muted-foreground">
              Your order has been successfully placed. You'll be receiving an
              email shortly with purchase details.
            </p>

            {/* Order Info */}
            {orderData.orderId && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-lg font-medium text-foreground">
                  Order #{orderData?.customOrderId || orderData?.orderId}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <button
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              onClick={handleContinue}
            >
              Check Order Details →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouModal;
