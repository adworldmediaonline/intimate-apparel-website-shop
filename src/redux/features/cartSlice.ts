import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError } from '@/utils/toast';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getCartItemId } from '@/lib/cart-item-id';

interface SelectedOption {
  title: string;
  price: number;
}

interface CartProduct {
  _id: string;
  title: string;
  img: string;
  sku: string;
  price?: number | string;
  finalPriceDiscount: number | string;
  orderQuantity: number;
  quantity?: number;
  slug?: string;
  selectedOption?: SelectedOption;
  selectedConfigurations?: Record<
    number,
    { optionIndex: number; option: { name: string; price: number } }
  >;
  customNotes?: Record<number, string>;
  basePrice?: number;
  shipping?: { price?: number };
  appliedCouponCode?: string;
  appliedCouponPercentage?: number;
}

interface LastAddedProduct {
  title: string;
  img: string;
  selectedOption?: SelectedOption;
  orderQuantity: number;
}

interface CartState {
  cart_products: CartProduct[];
  orderQuantity: number;
  cartMiniOpen: boolean;
  showCartConfirmation: boolean;
  lastAddedProduct: LastAddedProduct | null;
  couponCode: string | null;
  discountAmount: number;
  /** When true, discount was auto-applied (show "X% OFF applied" instead of discount line) */
  isAutoApplied: boolean;
}

const initialState: CartState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
  showCartConfirmation: false,
  lastAddedProduct: null,
  couponCode: null,
  discountAmount: 0,
  isAutoApplied: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add_cart_product: (state, { payload }: PayloadAction<CartProduct>) => {
      const productId = getCartItemId(payload);

      const isExist = state.cart_products.some((item: CartProduct) => {
        return getCartItemId(item) === productId;
      });

      if (!isExist) {
        const newItem: CartProduct = {
          ...payload,
          orderQuantity: state.orderQuantity,
          ...(payload.finalPriceDiscount && {
            price: parseFloat(String(payload.finalPriceDiscount)),
          }),
        };

        state.cart_products.push(newItem);

        state.showCartConfirmation = true;
        state.lastAddedProduct = {
          title: payload.title,
          img: payload.img,
          selectedOption: payload.selectedOption,
          orderQuantity: state.orderQuantity,
        };
      } else {
        state.cart_products = state.cart_products.map((item: CartProduct) => {
          if (getCartItemId(item) !== productId) {
            return { ...item } as CartProduct;
          }

          if (
            (Number(item.quantity) || 0) >=
            (Number(item.orderQuantity) || 0) + state.orderQuantity
          ) {
            item.orderQuantity =
              state.orderQuantity !== 1
                ? state.orderQuantity + Number(item.orderQuantity || 0)
                : Number(item.orderQuantity || 0) + 1;

            state.showCartConfirmation = true;
            state.lastAddedProduct = {
              title: item.title,
              img: item.img,
              selectedOption: item.selectedOption,
              orderQuantity: state.orderQuantity,
            };
          } else {
            notifyError('No more quantity available for this product!');
            state.orderQuantity = 1;
          }
          return { ...item } as CartProduct;
        });
      }

      setLocalStorage('cart_products', state.cart_products);
    },
    increment: state => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: state => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    quantityDecrement: (state, { payload }: PayloadAction<CartProduct>) => {
      const targetId = getCartItemId(payload);
      state.cart_products.forEach((item: CartProduct) => {
        if (getCartItemId(item) === targetId && Number(item.orderQuantity || 0) > 1) {
          item.orderQuantity = Number(item.orderQuantity || 0) - 1;
        }
      });

      setLocalStorage('cart_products', state.cart_products);
    },
    remove_product: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: string;
        title: string;
        selectedOption?: SelectedOption;
        selectedConfigurations?: Record<
          number,
          { optionIndex: number; option: { name: string; price: number } }
        >;
        customNotes?: Record<number, string>;
      }>
    ) => {
      const targetId = getCartItemId({
        _id: payload.id,
        selectedOption: payload.selectedOption,
        selectedConfigurations: payload.selectedConfigurations,
        customNotes: payload.customNotes,
      });

      state.cart_products = state.cart_products.filter((item: CartProduct) => {
        return getCartItemId(item) !== targetId;
      });

      setLocalStorage('cart_products', state.cart_products);

      if (state.cart_products.length === 0) {
        state.showCartConfirmation = false;
        state.lastAddedProduct = null;
      }
    },
    update_product_option: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: string;
        selectedOption?: SelectedOption;
        selectedConfigurations?: Record<
          number,
          { optionIndex: number; option: { name: string; price: number } }
        >;
        customNotes?: Record<number, string>;
      }>
    ) => {
      const targetId = getCartItemId({
        _id: payload.id,
        selectedOption: payload.selectedOption,
        selectedConfigurations: payload.selectedConfigurations,
        customNotes: payload.customNotes,
      });
      state.cart_products = state.cart_products.filter(
        (item: CartProduct) => getCartItemId(item) !== targetId
      );

      setLocalStorage('cart_products', state.cart_products);
    },
    get_cart_products: state => {
      const shouldShowModal = state.showCartConfirmation;
      const savedLastProduct = state.lastAddedProduct;

      const raw = (getLocalStorage('cart_products') || []) as CartProduct[];
      // Legacy migration: ensure all items have finalPriceDiscount (use price/updatedPrice fallback once)
      state.cart_products = raw.map((item: CartProduct) => {
        const hasFinal = item.finalPriceDiscount != null && item.finalPriceDiscount !== '';
        if (hasFinal) return item;
        const fallback = Number((item as { updatedPrice?: number }).updatedPrice ?? item.price ?? 0);
        return { ...item, finalPriceDiscount: fallback };
      });
      state.cartMiniOpen = false;

      if (shouldShowModal) {
        state.showCartConfirmation = true;
        state.lastAddedProduct = savedLastProduct;
      } else {
        state.lastAddedProduct = null;
      }
    },
    initialOrderQuantity: state => {
      state.orderQuantity = 1;
    },
    clearCart: state => {
      state.cart_products = [];
      state.showCartConfirmation = false;
      state.lastAddedProduct = null;
      state.couponCode = null;
      state.discountAmount = 0;
      state.isAutoApplied = false;

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('applied_coupon', null);
    },
    applyCoupon: (
      state,
      {
        payload,
      }: PayloadAction<{
        code: string;
        discountAmount: number;
        isAutoApplied?: boolean;
      }>
    ) => {
      state.couponCode = payload.code;
      state.discountAmount = payload.discountAmount;
      state.isAutoApplied = payload.isAutoApplied ?? false;
      /**
       * Persisted alongside the cart, because the coupon belongs to the cart.
       * It used to live only in memory, which was survivable when checkout
       * was a single page; now that checkout is three pages, every step is a
       * real navigation and an applied coupon vanished on the way to payment.
       */
      setLocalStorage('applied_coupon', {
        code: state.couponCode,
        discountAmount: state.discountAmount,
        isAutoApplied: state.isAutoApplied,
      });
    },
    removeCoupon: state => {
      state.couponCode = null;
      state.discountAmount = 0;
      state.isAutoApplied = false;
      setLocalStorage('applied_coupon', null);
    },
    /** Restore the applied coupon after a navigation or a reload. */
    get_applied_coupon: state => {
      const saved = getLocalStorage('applied_coupon') as
        | { code?: string; discountAmount?: number; isAutoApplied?: boolean }
        | null
        | unknown[];
      // getLocalStorage seeds [] for a missing key, so an array means "none".
      if (!saved || Array.isArray(saved) || !(saved as any).code) return;
      state.couponCode = (saved as any).code;
      state.discountAmount = Number((saved as any).discountAmount) || 0;
      state.isAutoApplied = Boolean((saved as any).isAutoApplied);
    },
    openCartMini: state => {
      state.cartMiniOpen = true;
      setLocalStorage('cartMiniOpen', true);
    },
    closeCartMini: state => {
      state.cartMiniOpen = false;
      setLocalStorage('cartMiniOpen', false);
    },
    hideCartConfirmation: state => {
      state.showCartConfirmation = false;
      state.lastAddedProduct = null;
    },
  },
});

export const {
  add_cart_product,
  increment,
  decrement,
  get_cart_products,
  remove_product,
  quantityDecrement,
  initialOrderQuantity,
  clearCart,
  closeCartMini,
  openCartMini,
  hideCartConfirmation,
  update_product_option,
  applyCoupon,
  removeCoupon,
  get_applied_coupon,
} = cartSlice.actions;
export default cartSlice.reducer;
