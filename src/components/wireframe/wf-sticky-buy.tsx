'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { add_cart_product, initialOrderQuantity } from '@/redux/features/cartSlice';

/** Slides in once the main buy button has scrolled out of view. */
export function WfStickyBuy({
  product,
  title,
  price,
  image,
  variantLabel,
  outOfStock = false,
  onAdd,
  onBuyNow,
}: {
  product: Record<string, any>;
  title: string;
  price: number;
  image?: string;
  variantLabel?: string;
  outOfStock?: boolean;
  /**
   * Supplied when the bar is rendered from the buy box, so it adds the pack the
   * shopper actually selected. Without them it falls back to adding the product
   * at its default price — correct only for products with no variants.
   */
  onAdd?: () => void;
  onBuyNow?: () => void;
}) {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const anchor = document.querySelector('.wf-buynow');
    if (!anchor) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, []);

  /**
   * Announce this bar on <body> while it is up.
   *
   * The floating cart pill is also fixed to the bottom of the viewport, and
   * the two landed on top of each other — the pill covered this bar's Buy It
   * Now button. The pill's own stylesheet watches for this class and lifts
   * itself clear; a class rather than a prop because the two components live
   * in different trees and never meet.
   */
  useEffect(() => {
    document.body.classList.toggle('wf-sticky-buy-open', show);
    return () => document.body.classList.remove('wf-sticky-buy-open');
  }, [show]);

  const addToCart = () => {
    if (outOfStock) return;
    if (onAdd) {
      onAdd();
      return;
    }
    dispatch(initialOrderQuantity());
    dispatch(add_cart_product({ ...product, finalPriceDiscount: price } as any));
  };

  return (
    <div className={`wf-sticky-buy${show ? ' show' : ''}`}>
      <div className="wf-sticky-inner">
        <div className="si-img">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" width={48} height={48} style={{ objectFit: 'cover' }} />
          )}
        </div>
        <div className="si-info">
          <b>{title}</b>
          <span>
            {CURRENCY_SYMBOL}
            {price}
            {variantLabel ? ` · ${variantLabel}` : ''}
          </span>
        </div>
        <div className="si-actions">
          <button type="button" className="wf-btn wf-btn-outline" onClick={addToCart} disabled={outOfStock}>
            Add to Cart
          </button>
          <button
            type="button"
            className="wf-btn wf-btn-accent"
            disabled={outOfStock}
            onClick={() => {
              if (onBuyNow) {
                onBuyNow();
                return;
              }
              addToCart();
              router.push('/checkout');
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default WfStickyBuy;
