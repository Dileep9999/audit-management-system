import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { OrderListItem } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface CustomerState {
  orderList: OrderListItem[];
  isLoading: boolean;
}

const initialState: CustomerState = {
  orderList: initStore("d-order-list"),
  isLoading: false,
};

const OrderListSlice = createSlice({
  name: "orderList",
  initialState,
  reducers: {
    // get order list
    getOrderList(state, action: PayloadAction<OrderListItem[]>) {
      state.orderList = action.payload;
    },

    // delete order list
    deleteOrderList(state, action: PayloadAction<number[]>) {
      if (state.orderList !== null) {
        state.orderList = state.orderList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // edit order list
    editOrderList(state, action: PayloadAction<OrderListItem>) {
      const orderList = action.payload;
      if (state.orderList !== null) {
        const findProjectIndex = state.orderList.findIndex(
          (item) => item._id === orderList._id,
        );
        const findProjectRecord = state.orderList.find(
          (item) => item._id === orderList._id,
        );
        if (findProjectIndex !== -1 && findProjectRecord) {
          state.orderList[findProjectIndex] = orderList;
        }
        LoadingToast();
      }
    },

    // add order list
    addOrderList(state, action: PayloadAction<OrderListItem>) {
      const newOrder = action.payload;
      if (state.orderList !== null) {
        state.orderList.unshift(newOrder);
      } else {
        state.orderList = [newOrder];
      }
    },
  },
});

export const { getOrderList, addOrderList, editOrderList, deleteOrderList } =
  OrderListSlice.actions;
export default OrderListSlice.reducer;
