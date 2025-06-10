import { AppDispatch } from "@src/slices/reducer";
import {
  getCategoryList,
  addCategoryList,
  editCategoryList,
  deleteCategoryList,
} from "./reducer";
import api from "@src/utils/axios_api";
import { REACT_APP_CATEGORY_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { CategoryItems } from "@src/dtos";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const CUSTOMER_LIST_API = REACT_APP_CATEGORY_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get customer list
export const getCategoryData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-category-list");
      if (!responseData) {
        const response = await api.get(CUSTOMER_LIST_API);
        createLocalStorage("d-category-list", response);
        dispatch(getCategoryList(response));
      } else {
        dispatch(getCategoryList(responseData));
      }
    } else {
      const response = await api.get(CUSTOMER_LIST_API);
      dispatch(getCategoryList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Category List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching category data:", error);
  }
};

// add record
export const addCategoryData =
  (newRecord: CategoryItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(CUSTOMER_LIST_API, newRecord, "Category");
      const { message } = response;
      AddToast(message || "Category List added successfully");
      addLocalStorageRecord("d-category-list", newRecord);
      dispatch(addCategoryList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Category List addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding category record:", error);
    }
  };

// edit data
export const editCategoryData =
  (category: CategoryItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(CUSTOMER_LIST_API, category, "Category");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Category record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-category-list", category);
      dispatch(editCategoryList(category));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Category List updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating  category record:", error);
    }
  };

// delete data
export const deleteCategoryData =
  (category: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = category.map(async (_id) => {
        const response = await api.delete(CUSTOMER_LIST_API, _id, "Category");
        const { message } = response;
        DeleteToast(message || "Category deleted successfully");
        return _id;
      });

      const deletedCategory = await Promise.all(deletePromises);
      dispatch(deleteCategoryList(deletedCategory));
      deleteLocalStorageRecord({
        key: "d-category-list",
        listRecord: category,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Category List deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting category: ", error);
    }
  };
