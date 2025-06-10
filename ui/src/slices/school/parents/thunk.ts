import { AppDispatch } from "@src/slices/reducer";
import api from "@src/utils/axios_api";
import { Parents } from "@src/dtos";
import { REACT_APP_SCHOOL_PARENTS_LIST } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import {
  addParentsList,
  deleteParentsList,
  editParentsList,
  getParentsList,
} from "./reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const SCHOOL_PARENTS_API = REACT_APP_SCHOOL_PARENTS_LIST;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get Parents list
export const getParentsListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-parents-list");
      if (!responseData) {
        const response = await api.get(SCHOOL_PARENTS_API);
        createLocalStorage("d-parents-list", response);
        dispatch(getParentsList(response));
      } else {
        dispatch(getParentsList(responseData));
      }
    } else {
      const response = await api.get(SCHOOL_PARENTS_API);
      dispatch(getParentsList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Parents List Fetch Failed.";
    ErrorToast(errorMessage);
    console.error("Error fetching parents List data:", error);
  }
};

export const addParentsListData =
  (newRecord: Parents) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(SCHOOL_PARENTS_API, newRecord, "Parents");
      const { message } = response;
      AddToast(message || "Parents added successfully");
      addLocalStorageRecord("d-parents-list", newRecord);
      dispatch(addParentsList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Parents addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding parents record:", error);
    }
  };

// edit parents record
export const editParentsListData =
  (question: Parents) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(SCHOOL_PARENTS_API, question, "Parents");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Book updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-parents-list", question);
      dispatch(editParentsList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Book update failed";
      ErrorToast(errorMessage);
      console.error("Error updating book record:", error);
    }
  };

// delete customer record
export const deleteParentsListData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (id) => {
        const response = await api.delete(SCHOOL_PARENTS_API, id, "Parents");
        const { message } = response;
        DeleteToast(message || "Parents record deleted successfully");
        return id;
      });

      const deletedParents = await Promise.all(deletePromises);
      dispatch(deleteParentsList(deletedParents));
      deleteLocalStorageRecord({
        key: "d-parents-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Parents deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting parents: ", error);
    }
  };
