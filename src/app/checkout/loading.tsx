import { Loader2 } from 'lucide-react';

const CheckoutLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span
        tabIndex={0}
        aria-label="Loading checkout content"
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10"
        role="status"
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </span>
      <h1 className="text-xl font-semibold text-foreground">
        Preparing your checkout...
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Hang tight, we’re getting your order ready for a smooth checkout experience.
      </p>
    </div>
  );
};

export default CheckoutLoading;
