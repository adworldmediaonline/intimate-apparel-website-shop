'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';
import { add_cart_product, initialOrderQuantity } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import WfStars from './wf-stars';

export interface WfProduct {
  id: string;
  title: string;
  category?: string;
  href?: string;
  image?: string;
  price: number;
  markedPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: { label: string; tone?: 'best' | 'new' | 'sale' | 'gift' };
  giftNote?: string;
  /** True when the buyer must pick a variant before this can go in the cart. */
  hasOptions?: boolean;
  outOfStock?: boolean;
  /** Raw product document, needed to add straight to the cart from the grid. */
  raw?: Record<string, any>;
}

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
}

/**
 * @param showAction Draw the Add to Cart / View Product button. Off by
 *   default: the button added ~48px to every card for an action the whole
 *   card already performs, and losing it brings most of the next row into
 *   view on a phone. Pass true where a grid wants the explicit button back.
 */
export function WfProductCard({
  product,
  showAction = false,
}: {
  product: WfProduct;
  showAction?: boolean;
}) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const wishlistId = String(product.raw?._id ?? product.id);
  const isWishlisted = useSelector((state: any) =>
    state.wishlist.wishlist.some((item: { _id: string }) => item._id === wishlistId)
  );

  const href = product.href ?? `/product/${product.id}`;
  const discount =
    product.markedPrice && product.markedPrice > product.price
      ? Math.round((1 - product.price / product.markedPrice) * 100)
      : 0;

  // A product with variants cannot be bought from the grid — a size and colour
  // have to be chosen first — so its button says what it actually does and
  // opens the product page. Only a product with nothing to choose adds straight
  // to the cart from here.
  const mustChoose = Boolean(product.hasOptions);

  const addToCart = () => {
    if (product.outOfStock || !product.raw) return;
    dispatch(initialOrderQuantity());
    dispatch(add_cart_product({ ...product.raw, finalPriceDiscount: product.price } as any));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = () => {
    dispatch(add_to_wishlist({
      ...product.raw,
      _id: wishlistId,
      title: product.title,
      img: product.raw?.img ?? product.image,
      finalPriceDiscount: product.price,
    }));
  };

  return (
    <article className="wf-product-card">
      <div className="wf-product-media">
        {product.badge && (
          <div className="wf-product-flags">
            <span className={`wf-badge wf-badge-${product.badge.tone ?? 'best'}`}>
              {product.badge.label}
            </span>
          </div>
        )}
        <button
          className="wf-wishlist"
          type="button"
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.title} ${isWishlisted ? 'from' : 'to'} wishlist`}
          aria-pressed={isWishlisted}
          onClick={toggleWishlist}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        <Link href={href} aria-label={product.title}>
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              // Cards sit in a 2-up grid on phones and a 4-up grid on
              // desktop, so ~400px covers the widest real slot.
              src={cloudinaryVariant(product.image, 400)}
              srcSet={cloudinarySrcSet(product.image, 400)}
              sizes="(max-width: 640px) 50vw, 25vw"
              alt={product.title}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span />
          )}
        </Link>
        {product.giftNote && <div className="wf-gift-flag">{product.giftNote}</div>}

      </div>

      <div className="wf-product-body">
        <h3 className="wf-product-title">
          <Link href={href}>{product.title}</Link>
        </h3>
        {typeof product.rating === 'number' && (
          <div className="wf-rating-row">
            <WfStars rating={product.rating} /> {product.rating.toFixed(2)}
            {product.reviewCount ? ` (${product.reviewCount})` : ''}
          </div>
        )}
        <div className="wf-price-row">
          <span className="wf-price">
            {CURRENCY_SYMBOL}
            {money(product.price)}
          </span>
          {discount > 0 && (
            <>
              <span className="wf-price-old">
                {CURRENCY_SYMBOL}
                {money(product.markedPrice!)}
              </span>
              <span className="wf-price-off">Save {discount}%</span>
            </>
          )}
        </div>

        {/* Out of stock is stated even on the button-less card: without it
            the only way to find out is to open the product page. */}
        {!showAction && product.outOfStock && (
          <p className="wf-stock-note">Out of Stock</p>
        )}

        {showAction && (
          <div className="wf-quick-add">
            {product.outOfStock ? (
              <span className="wf-btn wf-btn-outline wf-btn-block" aria-disabled="true">
                Out of Stock
              </span>
            ) : mustChoose ? (
              <Link href={href} className="wf-btn wf-btn-accent wf-btn-block">
                View Product
              </Link>
            ) : (
              <button
                type="button"
                className="wf-btn wf-btn-accent wf-btn-block"
                onClick={addToCart}
              >
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default WfProductCard;
