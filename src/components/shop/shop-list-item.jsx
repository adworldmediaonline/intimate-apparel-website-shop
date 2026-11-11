import { CURRENCY_SYMBOL } from '@/lib/brand';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { Rating } from 'react-simple-star-rating';
import Link from 'next/link';
import { Heart } from 'lucide-react';
// internal
import { Cart, CompareThree, QuickView } from '@/svg';
import { handleProductModal } from '@/redux/features/productModalSlice';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import { isOutOfStock } from '@/lib/product-stock';
import { notifyError } from '@/utils/toast';

const ShopListItem = ({ product }) => {
  const {
    _id,
    img,
    category,
    title,
    reviews,
    price,
    discount,
    tags,
    description,
    slug,
  } = product || {};
  const dispatch = useDispatch();
  const [ratingVal, setRatingVal] = useState(0);
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // handle add product
  const handleAddProduct = async prd => {
    if (isOutOfStock(prd)) {
      notifyError('This product is out of stock.');
      return;
    }
    try {
      const result = await fetchProduct(prd._id);
      if (result.error || !result.data) {
        notifyError('Unable to verify product availability. Please try again.');
        return;
      }
      const freshProduct = result.data;
      if (isOutOfStock(freshProduct)) {
        notifyError('This product is out of stock.');
        return;
      }
      const availableQty = Number(freshProduct?.quantity ?? 0);
      const existingProduct = cart_products.find(item => item._id === prd._id);
      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
      const requestedQty = currentQty + 1;
      if (availableQty < requestedQty) {
        notifyError(
          `Sorry, only ${availableQty} items available. ${existingProduct ? `You already have ${currentQty} in your cart.` : ''}`
        );
        return;
      }
      dispatch(add_cart_product({ ...prd, quantity: availableQty }));
    } catch {
      notifyError('Unable to verify product availability. Please try again.');
    }
  };
  // handle wishlist product
  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="tp-product-list-item d-md-flex">
      <div className="tp-product-list-thumb p-relative fix">
        <Link href={`/product/${slug}`}>
          <Image src={img} alt="product img" width={350} height={310} />
        </Link>

        {/* <!-- product action --> */}
        <div className="tp-product-action-2 tp-product-action-blackStyle">
          <div className="tp-product-action-item-2 d-flex flex-column">
            <button
              type="button"
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Quick View
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleWishlistProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-wishlist-btn"
            >
              <Heart />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Wishlist
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleCompareProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Compare
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="tp-product-list-content">
        <div className="tp-product-content-2 pt-15">
          <div className="tp-product-tag-2">
            {tags?.map((t, i) => (
              <a key={i} href="#">
                {t}
              </a>
            ))}
          </div>
          <h3 className="tp-product-title-2">
            <Link href={`/product/${slug}`}>{title}</Link>
          </h3>
          <div className="tp-product-rating-icon tp-product-rating-icon-2">
            <Rating
              allowFraction
              size={16}
              initialValue={ratingVal}
              readonly={true}
            />
          </div>
          <div className="tp-product-price-wrapper-2">
            {discount > 0 ? (
              <>
                <span className="tp-product-price-2 new-price">{CURRENCY_SYMBOL}{price}</span>
                <span className="tp-product-price-2 old-price">
                  {' '}
                  ₹
                  {(
                    Number(price) -
                    (Number(price) * Number(discount)) / 100
                  ).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="tp-product-price-2 new-price">{CURRENCY_SYMBOL}{price}</span>
            )}
          </div>
          <p>{description.substring(0, 100)}</p>
          <div className="tp-product-list-add-to-cart">
            <button
              onClick={() => handleAddProduct(product)}
              className="tp-product-list-add-to-cart-btn"
              disabled={isOutOfStock(product)}
              type="button"
            >
              {isOutOfStock(product) ? 'Out of Stock' : 'Add To Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;
