import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError, notifySuccess } from '@/utils/toast';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface CompareItem {
  _id: string;
  title: string;
  [key: string]: unknown;
}

interface CompareState {
  compareItems: CompareItem[];
}

const initialState: CompareState = {
  compareItems: [],
};

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    add_to_compare: (state, { payload }: PayloadAction<CompareItem>) => {
      const isExist = state.compareItems.some(item => item._id === payload._id);
      if (!isExist) {
        state.compareItems.push(payload);
        notifySuccess(`${payload.title} added to compare`);
      } else {
        state.compareItems = state.compareItems.filter(
          item => item._id !== payload._id
        );
        notifyError(`${payload.title} removed from compare`);
      }
      setLocalStorage('compare_items', state.compareItems);
    },
    remove_compare_product: (
      state,
      { payload }: PayloadAction<{ id: string; title: string }>
    ) => {
      state.compareItems = state.compareItems.filter(
        item => item._id !== payload.id
      );
      setLocalStorage('compare_items', state.compareItems);
      notifyError(`${payload.title} removed from compare`);
    },
    get_compare_products: state => {
      state.compareItems = (getLocalStorage('compare_items') ||
        []) as CompareItem[];
    },
  },
});

export const { add_to_compare, get_compare_products, remove_compare_product } =
  compareSlice.actions;
export default compareSlice.reducer;
