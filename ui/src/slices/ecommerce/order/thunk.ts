import { AppDispatch } from "@src/slices/reducer";
import {
  getOrderList,
  addOrderList,
  editOrderList,
  deleteOrderList,
} from "./reducer";
import api from "@src/utils/axios_api";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { REACT_APP_ORDER_API } from "@src/utils/url_helper";
import { OrderListItem } from "@src/dtos";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const ORDER_LIST_API = REACT_APP_ORDER_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get order list
export const getOrderData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-order-list");
      if (!responseData) {
        const response = await api.get(ORDER_LIST_API);
        createLocalStorage("d-order-list", response);
        dispatch(getOrderList(response));
      } else {
        dispatch(getOrderList(responseData));
      }
    } else {
      const response = await api.get(ORDER_LIST_API);
      dispatch(getOrderList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Order List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching Order data:", error);
  }
};

// add record
export const addOrderData =
  (newRecord: OrderListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(ORDER_LIST_API, newRecord, "Order");
      const { message } = response;
      AddToast(message || "Order List added successfully");
      addLocalStorageRecord("d-order-list", newRecord);
      dispatch(addOrderList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Order List addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding order record:", error);
    }
  };

// edit data
export const editOrderData =
  (order: OrderListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(ORDER_LIST_API, order, "Order");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "User Order updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-order-list", order);
      dispatch(editOrderList(order));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Order List updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating order record:", error);
    }
  };

// delete data
export const deleteOrderData =
  (reviews: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = reviews.map(async (_id) => {
        const response = await api.delete(ORDER_LIST_API, _id, "Order");
        const { message } = response;
        DeleteToast(message || "Order List deleted successfully");
        return _id;
      });

      const deletedOrders = await Promise.all(deletePromises);
      dispatch(deleteOrderList(deletedOrders));
      deleteLocalStorageRecord({
        key: "d-order-list",
        listRecord: reviews,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Order List deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting orders: ", error);
    }
  };
