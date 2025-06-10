import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { ShopCartProduct } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface ShopCartState {
  shopCartList: ShopCartProduct[] | null;
  isLoading: boolean;
}

const initialState: ShopCartState = {
  shopCartList: initStore("d-shop-cart-list"),
  isLoading: false,
};

const ShopCartSlice = createSlice({
  name: "shop_cart_list",
  initialState,
  reducers: {
    // get ecommerce shop cart list data
    getEcommerceShopCartList(state, action: PayloadAction<ShopCartProduct[]>) {
      state.shopCartList = action.payload;
    },

    // edit shop cart list
    modifyProduct(state, action: PayloadAction<ShopCartProduct>) {
      const updatedShopCart = action.payload;
      if (state.shopCartList !== null) {
        const findShopCartIndex = state.shopCartList.findIndex(
          (item) => item._id === updatedShopCart._id,
        );
        if (findShopCartIndex !== -1) {
          state.shopCartList[findShopCartIndex] = updatedShopCart;
        }
        LoadingToast();
      }
    },

    // delete shop cart product
    removeShopProduct(state, action: PayloadAction<number[]>) {
      if (state.shopCartList !== null) {
        state.shopCartList = state.shopCartList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // add new shop cart product
    addShopProduct(state, action: PayloadAction<ShopCartProduct>) {
      const newProduct = action.payload;
      if (state.shopCartList !== null) {
        state.shopCartList.unshift(newProduct);
      } else {
        state.shopCartList = [newProduct];
      }
    },
  },
});

export const {
  getEcommerceShopCartList,
  modifyProduct,
  removeShopProduct,
  addShopProduct,
} = ShopCartSlice.actions;
export default ShopCartSlice.reducer;
