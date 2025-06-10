import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { CheckoutProductAddress } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface CheckoutState {
  checkoutAddressList: CheckoutProductAddress[] | null;
  isLoading: boolean;
}

const initialState: CheckoutState = {
  checkoutAddressList: initStore("d-address-list"),
  isLoading: false,
};

const CheckoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    // get checkout list
    getCheckoutList(state, action) {
      state.checkoutAddressList = action.payload;
    },

    // add new checkout list record
    addCheckoutListRecord(
      state,
      action: PayloadAction<CheckoutProductAddress>,
    ) {
      const newAddress = action.payload;
      if (state.checkoutAddressList !== null) {
        state.checkoutAddressList.unshift(newAddress);
      } else {
        state.checkoutAddressList = [newAddress];
      }
    },

    // edit checkout list record
    editCheckoutListRecord(
      state,
      action: PayloadAction<CheckoutProductAddress>,
    ) {
      const existAddress = action.payload;
      if (state.checkoutAddressList !== null) {
        const findAddressIndex = state.checkoutAddressList.findIndex(
          (item) => item._id === existAddress._id,
        );
        if (findAddressIndex !== -1) {
          state.checkoutAddressList[findAddressIndex] = existAddress;
        }
        LoadingToast();
      }
    },

    // delete checkout list record
    deleteCheckoutListRecord(state, action: PayloadAction<number[]>) {
      if (state.checkoutAddressList !== null) {
        state.checkoutAddressList = state.checkoutAddressList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getCheckoutList,
  editCheckoutListRecord,
  addCheckoutListRecord,
  deleteCheckoutListRecord,
} = CheckoutSlice.actions;
export default CheckoutSlice.reducer;
