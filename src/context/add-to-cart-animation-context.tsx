'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface AddToCartAnimationProduct {
  _id: string;
  img: string;
  title?: string;
}

interface AddToCartAnimationContextValue {
  triggerAddToCartAnimation: (
    product: AddToCartAnimationProduct,
    sourceRect: DOMRect
  ) => void;
  registerTargetRef: (ref: RefObject<HTMLElement | null>) => void;
}

const AddToCartAnimationContext =
  createContext<AddToCartAnimationContextValue | null>(null);

const FLY_DURATION = 0.45;
const FLYING_IMAGE_SIZE = 64;

function getFallbackTargetRect(): DOMRect {
  return new DOMRect(
    typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 0,
    typeof window !== 'undefined' ? window.innerHeight - 80 : 0,
    32,
    32
  );
}

export function AddToCartAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const targetRefRef = useRef<RefObject<HTMLElement | null> | null>(null);
  const [flyingState, setFlyingState] = useState<{
    product: AddToCartAnimationProduct;
    sourceRect: DOMRect;
  } | null>(null);

  const registerTargetRef = useCallback(
    (ref: RefObject<HTMLElement | null>) => {
      targetRefRef.current = ref;
    },
    []
  );

  const triggerAddToCartAnimation = useCallback(
    (product: AddToCartAnimationProduct, sourceRect: DOMRect) => {
      if (!product.img) return;
      setFlyingState({ product, sourceRect });
    },
    []
  );

  const handleAnimationComplete = useCallback(() => {
    setFlyingState(null);
  }, []);

  const value: AddToCartAnimationContextValue = {
    triggerAddToCartAnimation,
    registerTargetRef,
  };

  return (
    <AddToCartAnimationContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        flyingState &&
        createPortal(
          <FlyingImage
            product={flyingState.product}
            sourceRect={flyingState.sourceRect}
            targetRefRef={targetRefRef}
            onComplete={handleAnimationComplete}
          />,
          document.body
        )}
    </AddToCartAnimationContext.Provider>
  );
}

function FlyingImage({
  product,
  sourceRect,
  targetRefRef,
  onComplete,
}: {
  product: AddToCartAnimationProduct;
  sourceRect: DOMRect;
  targetRefRef: RefObject<RefObject<HTMLElement | null> | null>;
  onComplete: () => void;
}) {
  const targetRect =
    targetRefRef.current?.current?.getBoundingClientRect() ??
    getFallbackTargetRect();

  const sourceCenter = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2,
  };
  const targetCenter = {
    x: targetRect.left + targetRect.width / 2,
    y: targetRect.top + targetRect.height / 2,
  };

  return (
    <motion.div
      className="fixed z-[10000] pointer-events-none"
      style={{
        left: sourceCenter.x - FLYING_IMAGE_SIZE / 2,
        top: sourceCenter.y - FLYING_IMAGE_SIZE / 2,
        width: FLYING_IMAGE_SIZE,
        height: FLYING_IMAGE_SIZE,
      }}
      initial={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: targetCenter.x - sourceCenter.x,
        y: targetCenter.y - sourceCenter.y,
        scale: 0.5,
        opacity: 0.9,
      }}
      transition={{
        duration: FLY_DURATION,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onAnimationComplete={onComplete}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-lg border border-gray-200 flex items-center justify-center">
        <Image
          src={product.img}
          alt={product.title || 'Product'}
          width={FLYING_IMAGE_SIZE}
          height={FLYING_IMAGE_SIZE}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    </motion.div>
  );
}

export function useAddToCartAnimation() {
  return useContext(AddToCartAnimationContext);
}
