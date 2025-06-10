import { AppDispatch } from "@src/slices/reducer";
import {
  getLeadList,
  addLeadList,
  editLeadList,
  deleteLeadList,
} from "./reducer";
import api from "@src/utils/axios_api";
import { REACT_APP_CRM_LEAD_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { LeadItem } from "@src/dtos";
import DeleteToast from "@src/components/custom/toast/deleteToast";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";

const LEAD_LIST_API = REACT_APP_CRM_LEAD_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get data
export const getLeadData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-crm-deal-list");
      if (!responseData) {
        const response = await api.get(LEAD_LIST_API);
        createLocalStorage("d-crm-deal-list", response);
        dispatch(getLeadList(response));
      } else {
        dispatch(getLeadList(responseData));
      }
    } else {
      const response = await api.get(LEAD_LIST_API);
      dispatch(getLeadList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lead List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching exam lead data:", error);
  }
};

// add lead record
export const addLeadData =
  (newRecord: LeadItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(LEAD_LIST_API, newRecord, "Lead");
      const { message } = response;
      AddToast(message || "Lead record added successfully");
      addLocalStorageRecord("d-crm-lead-list", newRecord);
      dispatch(addLeadList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lead record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding lead record:", error);
    }
  };

// edit lead record
export const editLeadData =
  (question: LeadItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(LEAD_LIST_API, question, "Lead");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Lead record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-crm-lead-list", question);
      dispatch(editLeadList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lead record updation failed";
      ErrorToast(errorMessage);
      console.error("Error adding record:", error);
    }
  };

// delete lead record
export const deleteLeadData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(LEAD_LIST_API, _id, "Lead");
        const { message } = response;
        DeleteToast(message || "Lead record deleted successfully");
        return _id;
      });

      const deletedLeads = await Promise.all(deletePromises);
      dispatch(deleteLeadList(deletedLeads));
      deleteLocalStorageRecord({
        key: "d-crm-lead-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lead record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting lead: ", error);
    }
  };
