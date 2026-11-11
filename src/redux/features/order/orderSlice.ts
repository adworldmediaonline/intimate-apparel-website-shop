import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shipping_info: {},
  stripe_client_secret: '',
  isCheckoutSubmitting: false,
  tax_preview: null,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    set_shipping: (state, { payload }) => {
      state.shipping_info = payload;
      localStorage.setItem('shipping_info', JSON.stringify(payload));
    },
    get_shipping: (state, { payload: _payload }) => {
      const data = localStorage.getItem('shipping_info');
      if (data) {
        state.shipping_info = JSON.parse(data);
      } else {
        state.shipping_info = {};
      }
    },
    set_client_secret: (state, { payload }) => {
      state.stripe_client_secret = payload;
    },
    begin_checkout_submission: state => {
      state.isCheckoutSubmitting = true;
    },
    end_checkout_submission: state => {
      state.isCheckoutSubmitting = false;
    },
    set_tax_preview: (state, { payload }) => {
      state.tax_preview = payload;
    },
  },
});

export const {
  get_shipping,
  set_shipping,
  set_client_secret,
  begin_checkout_submission,
  end_checkout_submission,
  set_tax_preview,
} = orderSlice.actions;
export default orderSlice.reducer;
