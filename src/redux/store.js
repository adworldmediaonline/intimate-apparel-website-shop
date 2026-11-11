import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { shopCartAddIntentMiddleware } from './middleware/shop-cart-add-intent-middleware';
import cartSlice from './features/cartSlice';
import compareSlice from './features/compareSlice';
import guestCartSlice from './features/guestCart/guestCartSlice';
import orderSlice from './features/order/orderSlice';
import productModalSlice from './features/productModalSlice';
import shopFilterSlice from './features/shop-filter-slice';
import wishlistSlice from './features/wishlist-slice';
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartSlice,
    order: orderSlice,
    wishlist: wishlistSlice,
    compare: compareSlice,
    guestCart: guestCartSlice,
    productModal: productModalSlice,
    shopFilter: shopFilterSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware, shopCartAddIntentMiddleware),
});

export default store;
