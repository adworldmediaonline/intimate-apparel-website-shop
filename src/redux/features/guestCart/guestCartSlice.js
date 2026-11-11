import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showModal: false,
  savedEmail: null,
};

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    showGuestCartModal: state => {
      state.showModal = true;
    },
    hideGuestCartModal: state => {
      state.showModal = false;
    },
    setGuestEmail: (state, action) => {
      state.savedEmail = action.payload;
    },
    clearGuestCartState: state => {
      state.showModal = false;
      state.savedEmail = null;
    },
  },
});

export const {
  showGuestCartModal,
  hideGuestCartModal,
  setGuestEmail,
  clearGuestCartState,
} = guestCartSlice.actions;

export default guestCartSlice.reducer;
