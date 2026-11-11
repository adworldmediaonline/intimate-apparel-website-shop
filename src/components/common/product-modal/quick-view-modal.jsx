import { CURRENCY_SYMBOL } from '@/lib/brand';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import { Rating } from 'react-simple-star-rating';
import CloudinaryImage from '../CloudinaryImage';
import { handleModalClose } from '@/redux/features/productModalSlice';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import {
  increment,
  decrement,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  getProductImageSrcForDisplay,
  getProductImageSrcsForGalleryForDisplay,
  getProductImageAlt,
  getVariantImageAlt,
} from '@/lib/product-image';
import { isOutOfStock } from '@/lib/product-stock';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import './quick-view-modal.css';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    padding: '10px',
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '1100px',
    width: '100%',
    maxHeight: '95vh',
    height: 'auto',
    margin: '0 auto',
    padding: '0',
    border: 'none',
    background: '#fff',
    overflow: 'hidden',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '16px',
    outline: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
  },
};

export default function QuickViewModal() {
  const { productItem, isModalOpen } = useSelector(state => state.productModal);
  const { orderQuantity, cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [fetchProduct] = useLazyGetProductQuery();

  const {
    _id,
    sku,
    title,
    category,
    description,
    discount,
    price,
    updatedPrice,
    finalPriceDiscount,
    reviews,
    tags,
    options,
  } = productItem || {};

  const outOfStock = isOutOfStock(productItem);
  const img = getProductImageSrcForDisplay(productItem || {});
  const imageURLs = getProductImageSrcsForGalleryForDisplay(productItem || {});
  const imageAlt = getProductImageAlt(productItem || {});

  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);
  const [selectedOption, setSelectedOption] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
    dispatch(initialOrderQuantity());
    setSelectedOption(null);
  }, [img, imageURLs, dispatch]);

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

  const calculateFinalPrice = () => {
    const mainPrice = Number(finalPriceDiscount ?? 0);
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (mainPrice + optionPrice).toFixed(2);
  };

  const calculateMarkedPrice = () => {
    const originalBase = Number(productItem?.displayMarkedPrice ?? finalPriceDiscount ?? 0);
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (originalBase + optionPrice).toFixed(2);
  };

  const showMarkedPrice = productItem?.hasDisplayDiscount ?? false;

  const handleOptionChange = e => {
    const optionIndex = e.target.value;
    if (optionIndex === '') {
      setSelectedOption(null);
    } else {
      setSelectedOption(options[parseInt(optionIndex)]);
    }
  };

  const handleAddProduct = async prd => {
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Re-fetch product to validate stock (handles stale page when another user bought last item)
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
      prd = { ...prd, quantity: Number(freshProduct?.quantity ?? 0) };
    } catch {
      notifyError('Unable to verify product availability. Please try again.');
      return;
    }

    const existingProduct = cart_products.find(item => item._id === prd._id);
    const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
    const totalRequestedQty = currentQty + orderQuantity;

    if (prd.quantity && totalRequestedQty > prd.quantity) {
      notifyError(
        `Sorry, only ${prd.quantity} items available. You already have ${currentQty} in your cart.`
      );
      return;
    }

    const mainPrice = Number(prd.finalPriceDiscount ?? 0);
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const totalPrice = mainPrice + optionPrice;

    const productToAdd = {
      ...prd,
      finalPriceDiscount: totalPrice,
      selectedOption,
      basePrice: Number(prd.displayMarkedPrice ?? prd.finalPriceDiscount ?? 0),
    };

    dispatch(add_cart_product(productToAdd));
    // Cart confirmation modal will handle user feedback - no toast needed
  };

  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
    notifySuccess('Product added to wishlist!');
  };

  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
    notifySuccess('Product added to compare!');
  };

  const handleImageActive = url => {
    setActiveImg(url);
  };

  return (
    <ReactModal
      isOpen={isModalOpen}
      onRequestClose={() => dispatch(handleModalClose())}
      appElement={document.getElementById('__next')}
      ariaHideApp={false}
      style={customStyles}
      contentLabel="Quick View Product"
    >
      <div className="quick-view-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Quick View</h2>
          <button
            onClick={() => dispatch(handleModalClose())}
            type="button"
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Image Gallery */}
          <div className="image-section">
            <div className="main-image">
              <CloudinaryImage
                src={activeImg}
                alt={imageAlt}
                width={500}
                height={500}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                crop="pad"
                gravity="center"
              />
              {outOfStock && (
                <div className="stock-badge">Out of Stock</div>
              )}
            </div>

            {imageURLs && imageURLs.length > 1 && (
              <div className="thumbnail-container">
                <div className="swipe-hint">
                  <span>Swipe to see more images</span>
                </div>
                <div className="thumbnail-gallery">
                  {imageURLs.map((url, i) => (
                    <button
                      key={i}
                      className={`thumbnail ${
                        url === activeImg ? 'active' : ''
                      }`}
                      onClick={() => handleImageActive(url)}
                      type="button"
                    >
                      <CloudinaryImage
                        src={url}
                        alt={getVariantImageAlt(productItem || {}, i, url)}
                        width={80}
                        height={80}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                        crop="pad"
                        gravity="center"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="scrollable-content">
              {category?.name && (
                <div className="product-category">{category.name}</div>
              )}

              <h1 className="product-title">{title}</h1>

              <div className="product-meta">
                <div className="rating-section">
                  <Rating
                    allowFraction
                    size={18}
                    initialValue={ratingVal}
                    readonly={true}
                  />
                  <span className="rating-count">
                    ({reviews?.length || 0} reviews)
                  </span>
                </div>

                <div className="availability">
                  <span className="availability-label">Availability:</span>
                  <span
                    className={`availability-status ${
                      outOfStock ? 'out-of-stock' : 'in-stock'
                    }`}
                  >
                    {outOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>

                {sku && (
                  <div className="sku">
                    <span className="sku-label">SKU:</span>
                    <span className="sku-value">{sku}</span>
                  </div>
                )}
              </div>

              <div className="price-section">
                {showMarkedPrice ? (
                  <div className="price-with-discount">
                    <span className="current-price">
                      {CURRENCY_SYMBOL}{calculateFinalPrice()}
                    </span>
                    <span className="original-price line-through">
                      {CURRENCY_SYMBOL}{calculateMarkedPrice()}
                    </span>
                  </div>
                ) : (
                  <span className="current-price">
                    {CURRENCY_SYMBOL}{calculateFinalPrice()}
                  </span>
                )}
                {selectedOption && (
                  <div className="option-info">
                    Selected: {selectedOption.title}
                  </div>
                )}
              </div>

              {description && (
                <div className="product-description">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        description.length > 150
                          ? description.substring(0, 150) + '...'
                          : description,
                    }}
                  />
                </div>
              )}

              {/* Options */}
              {options && options.length > 0 && (
                <div className="options-section">
                  <label className="options-label">Choose Option:</label>
                  <select
                    className="options-select"
                    value={
                      selectedOption ? options.indexOf(selectedOption) : ''
                    }
                    onChange={handleOptionChange}
                  >
                    <option value="">Select an option</option>
                    {options.map((option, index) => (
                      <option key={index} value={index}>
                        {option.title} (+{CURRENCY_SYMBOL}{option.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Options */}
              {imageURLs?.some(item => item?.color && item?.color?.name) && (
                <div className="color-options">
                  <label className="color-label">Color:</label>
                  <div className="color-swatches">
                    {imageURLs
                      .filter(item => item?.color && item?.color?.name)
                      .map((item, i) => (
                        <button
                          key={i}
                          className={`color-swatch ${
                            item.img === activeImg ? 'active' : ''
                          }`}
                          onClick={() => handleImageActive(item.img)}
                          style={{ backgroundColor: item.color.clrCode }}
                          title={item.color.name}
                          type="button"
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quantity-section">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn quantity-decrease"
                    onClick={() => dispatch(decrement())}
                    disabled={orderQuantity <= 1}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <div className="quantity-display">
                    <span className="quantity-value">{orderQuantity}</span>
                  </div>
                  <button
                    className="quantity-btn quantity-increase"
                    onClick={() => {
                      if (productItem?.quantity) {
                        const existingProduct = cart_products.find(
                          item => item._id === productItem._id
                        );
                        const currentQty = existingProduct
                          ? existingProduct.orderQuantity
                          : 0;
                        const totalRequestedQty =
                          currentQty + orderQuantity + 1;

                        if (totalRequestedQty > productItem.quantity) {
                          notifyError(
                            `Sorry, only ${productItem.quantity} items available. You already have ${currentQty} in your cart.`
                          );
                          return;
                        }
                      }
                      dispatch(increment());
                    }}
                    type="button"
                    aria-label="Increase quantity"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="tags-section">
                  <span className="tags-label">Tags:</span>
                  <div className="tags">
                    {tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Buttons */}
            <div className="sticky-actions">
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddProduct(productItem)}
                disabled={outOfStock}
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="btn-text">Add to Cart</span>
              </button>

              <div className="secondary-actions">
                <button
                  className="wishlist-btn"
                  onClick={() => handleWishlistProduct(productItem)}
                  type="button"
                  title="Add to Wishlist"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                  </svg>
                  <span className="btn-text-mobile">Wishlist</span>
                </button>

                <button
                  className="compare-btn"
                  onClick={() => handleCompareProduct(productItem)}
                  type="button"
                  title="Add to Compare"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                    <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"></path>
                  </svg>
                  <span className="btn-text-mobile">Compare</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  );
}
