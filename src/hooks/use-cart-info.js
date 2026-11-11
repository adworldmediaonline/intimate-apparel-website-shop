'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useCartInfo = () => {
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const { cart_products, discountAmount } = useSelector(state => state.cart);

  useEffect(() => {
    const cart = cart_products.reduce(
      (cartTotal, cartItem) => {
        const { finalPriceDiscount, orderQuantity } = cartItem;
        const qty = Number(orderQuantity) || 0;
        const rawPrice = Number(finalPriceDiscount ?? 0);
        const unitPrice = Math.round(rawPrice * 100) / 100;
        const itemTotal = Math.round(unitPrice * qty * 100) / 100;
        cartTotal.total += itemTotal;
        cartTotal.quantity += qty;

        return cartTotal;
      },
      {
        total: 0,
        quantity: 0,
      }
    );

    const roundedSubtotal = Math.round(cart.total * 100) / 100;
    setSubtotal(roundedSubtotal);
    setQuantity(cart.quantity);
    setTotal(Math.max(0, roundedSubtotal - (discountAmount ?? 0)));
  }, [cart_products, discountAmount]);

  return {
    quantity,
    total,
    subtotal,
    setTotal,
  };
};

export default useCartInfo;
