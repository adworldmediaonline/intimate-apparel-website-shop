'use client';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

// internal
import { decrement, increment } from '@/redux/features/cartSlice';
import { notifyError } from '@/utils/toast';

const ProductQuantity = ({ productItem }) => {
  const { orderQuantity, cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  // handleIncrease
  const handleIncrease = () => {
    // Check if we have a product with quantity limitations
    if (productItem?.quantity) {
      // Check if product already exists in cart
      const existingProduct = cart_products.find(
        item => item._id === productItem._id
      );

      // Get total current quantity (existing + new)
      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
      const totalRequestedQty = currentQty + orderQuantity + 1; // +1 because we're increasing

      // If requested quantity exceeds available
      if (totalRequestedQty > productItem.quantity) {
        notifyError(
          `Sorry, only ${productItem.quantity} items available. You already have ${currentQty} in your cart.`
        );
        return;
      }
    }

    dispatch(increment());
  };

  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement());
  };

  return (
    <div className="flex items-center border border-input rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={orderQuantity <= 1}
        className="h-12 w-12 rounded-none border-0 hover:bg-muted focus:z-10 focus:ring-2 focus:ring-ring focus:ring-offset-0"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </Button>

      <div className="flex items-center justify-center min-w-[60px] h-12 bg-background border-x border-input">
        <span className="text-lg font-medium text-foreground">
          {orderQuantity}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        className="h-12 w-12 rounded-none border-0 hover:bg-muted focus:z-10 focus:ring-2 focus:ring-ring focus:ring-offset-0"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ProductQuantity;
