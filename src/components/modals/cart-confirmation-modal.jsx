'use client';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { useAddToCartAnimation } from '@/context/add-to-cart-animation-context';
import Image from 'next/image';
import Link from 'next/link';

export default function CartConfirmationModal() {
  const modalRef = useRef(null);
  const imageContainerRef = useRef(null);
  const pathname = usePathname();
  const addToCartAnimation = useAddToCartAnimation();

  useEffect(() => {
    addToCartAnimation?.registerTargetRef(imageContainerRef);
  }, [addToCartAnimation]);

  const { cart_products } = useSelector(state => state.cart);

  // Show on Shop page and Product details page; remain visible while cart has items (no close/hide)
  const isShopPage = pathname === '/shop';
  const isProductDetailsPage = pathname.startsWith('/product/');
  const shouldShowModal = isShopPage || isProductDetailsPage;
  const hasItems = cart_products.length > 0;

  const totalItems = cart_products.reduce(
    (total, item) => total + item.orderQuantity,
    0
  );

  if (!shouldShowModal || !hasItems) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideUpCenter {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .cart-modal-container {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translate(-50%, 20px);
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          animation: slideUpCenter 0.3s ease-out forwards;
          transition: bottom 0.3s ease;
        }
        /*
          The product page's sticky buy bar is also pinned to the bottom, and
          this pill sat directly on top of its Buy It Now button. While that
          bar is up it adds this class to the body, and the pill rides above
          it.

          85px is the bar's height - 12px padding, a 48px thumbnail, 12px
          padding and its top border - plus a small gap. Keep it in step with
          the .wf-sticky-inner rule in wireframe.css if that padding changes.
        */
        body.wf-sticky-buy-open .cart-modal-container {
          bottom: calc(1.25rem + 85px);
        }
      `}</style>
      <div
        ref={modalRef}
        className="cart-modal-container"
      >
        {/* Brand-colour bar with everything inside */}
        <div
          className="bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-200 min-w-[200px] max-w-[300px] h-14 flex items-center gap-3 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] pointer-events-auto relative"
        >
          <Link
            href="/checkout"
            className="flex items-center gap-3 flex-1 cursor-pointer"
          >
            {/* Product Images - Stacked, with enter/exit animations */}
            {cart_products.length > 0 && (
              <div
                ref={imageContainerRef}
                className="shrink-0 relative w-20 h-8 flex items-center justify-start"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {cart_products.slice(-3).map((product, index) => {
                    const startIndex = Math.max(
                      0,
                      cart_products.length - 3
                    );
                    const uniqueKey = `cart-item-${startIndex + index}`;
                    const isNewest =
                      index === cart_products.slice(-3).length - 1;
                    return (
                      <motion.div
                        key={uniqueKey}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{
                          opacity: isNewest ? 1 : 0.6,
                          x: index * 8,
                          y: 0,
                        }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{
                          type: 'tween',
                          duration: 0.25,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="absolute w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm border border-gray-200"
                        style={{
                          zIndex: index + 1,
                          left: 0,
                        }}
                      >
                        <Image
                          src={product.img}
                          alt={product.title || 'Product'}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover rounded-full"
                          unoptimized
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Text Content */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* <span className="font-semibold text-base whitespace-nowrap">
                View cart
              </span> */}
              <span className="bg-white/25 px-2 py-1 rounded-xl text-sm font-medium whitespace-nowrap">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Arrow - inside circle with darker background */}
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/15 text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>
      {/*
        The pill is position:fixed at the bottom of the viewport, so it sat on
        top of whatever happened to be there — on the product page that was
        the thumbnail strip, permanently hidden behind it.

        This spacer reserves the pill's height at the end of the document so
        the last stretch of content can always be scrolled clear of it. It is
        rendered only while the pill is, so no gap appears when the cart is
        empty.
      */}
      <div aria-hidden="true" style={{ height: '88px' }} />
    </>
  );
}
