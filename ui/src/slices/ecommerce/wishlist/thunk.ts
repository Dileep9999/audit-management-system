import { AppDispatch } from "@src/slices/reducer";
import {
  addWishListProduct,
  getWishListData,
  modifyWishListProductQuantity,
  removeWishListProduct,
} from "./reducer";
import api from "@src/utils/axios_api";
import { WishListProduct } from "@src/dtos";
import { REACT_APP_WISHLIST_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const USER_WISHLIST_API = REACT_APP_WISHLIST_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

//  get wishlist data
export const getWishList = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-wishlist");
      if (!responseData) {
        const response = await api.get(USER_WISHLIST_API);
        createLocalStorage("d-wishlist", response);
        dispatch(getWishListData(response));
      } else {
        dispatch(getWishListData(responseData));
      }
    } else {
      const response = await api.get(USER_WISHLIST_API);
      dispatch(getWishListData(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Wishlist Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching whish list data:", error);
  }
};

// add customer record
export const addWishListProductRecord =
  (newRecord: WishListProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        USER_WISHLIST_API,
        newRecord,
        "Wishlist record",
      );
      const { message } = response;
      AddToast(message || "Wishlist record added successfully");
      addLocalStorageRecord("d-wishlist", newRecord);
      dispatch(addWishListProduct(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Wishlist record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding whish list record:", error);
    }
  };

// update wishlist record
export const updateWishListProductQuantity =
  (product: WishListProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        USER_WISHLIST_API,
        product,
        "Wishlist record",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Wishlist record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-wishlist", product);
      dispatch(modifyWishListProductQuantity(product));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Wishlist record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating whish list record:", error);
    }
  };

// delete wishlist record from wishlist
export const deleteWishListProduct =
  (whishlist: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = whishlist.map(async (id) => {
        const response = await api.delete(
          USER_WISHLIST_API,
          id,
          "Wishlist record",
        );
        const { message } = response;
        DeleteToast(message || "Product deleted successfully");
        return id;
      });

      const deletedWishlist = await Promise.all(deletePromises);
      dispatch(removeWishListProduct(deletedWishlist));
      deleteLocalStorageRecord({
        key: "d-shop-cart-list",
        listRecord: whishlist,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "wishlist record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting whish list: ", error);
    }
  };
