import api from "@src/utils/axios_api";
import { AppDispatch } from "@src/slices/reducer";
import {
  getInvoiceList,
  deleteInvoiceRecord,
  editInvoiceRecord,
  addInvoiceRecord,
  setCurrentInvoiceRecord,
} from "./reducer";
import { InvoiceList } from "@src/dtos";
import {
  createLocalStorage,
  addLocalStorageRecord,
  updateLocalStorageRecord,
  deleteLocalStorageRecord,
  getLocalStorage,
} from "@src/utils/crud_functions";
import { REACT_APP_INVOICE_API } from "@src/utils/url_helper";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const INVOICE_LIST_API = REACT_APP_INVOICE_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get invoice list
export const getInvoiceListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-invoice-list");
      if (!responseData) {
        const response = await api.get(INVOICE_LIST_API);
        createLocalStorage("d-invoice-list", response);
        dispatch(getInvoiceList(response));
      } else {
        dispatch(getInvoiceList(responseData));
      }
    } else {
      const response = await api.get(INVOICE_LIST_API);
      dispatch(getInvoiceList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Invoice List Fetch Failed.";
    ErrorToast(errorMessage);
    console.error("Error fetching invoice list data:", error);
  }
};

// delete invoice record
export const deleteInvoiceListRecordData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(INVOICE_LIST_API, _id, "Invoice");
        const { message } = response;
        DeleteToast(message || "Invoice record deleted successfully");
        return _id;
      });

      const deletedInvoice = await Promise.all(deletePromises);
      dispatch(deleteInvoiceRecord(deletedInvoice));
      deleteLocalStorageRecord({
        key: "d-invoice-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invoice deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting invoice: ", error);
    }
  };

// edit invoice record
export const editInvoiceListRecordData =
  (question: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(INVOICE_LIST_API, question, "Invoice");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Invoice updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-invoice-list", question);
      dispatch(editInvoiceRecord(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invoice update failed";
      ErrorToast(errorMessage);
      console.error("Error updating invoice record:", error);
    }
  };

// add invoice record
export const addInvoiceListRecordData =
  (newRecord: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(INVOICE_LIST_API, newRecord, "Invoice");
      const { message } = response;
      AddToast(message || "Invoice added successfully");
      addLocalStorageRecord("d-invoice-list", newRecord);
      dispatch(addInvoiceRecord(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invoice addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding invoice record:", error);
    }
  };

// set current invoice record
export const setCurrentInvoiceListRecord =
  (isOpen: boolean, invoice: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = { mode: isOpen, data: invoice };
      dispatch(
        setCurrentInvoiceRecord({ mode: response.mode, list: response.data }),
      );
    } catch (error) {
      console.error("Error setting current invoice record:", error);
    }
  };
