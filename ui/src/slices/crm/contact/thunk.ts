import { AppDispatch } from "@src/slices/reducer";
import {
  getContactList,
  addContactList,
  editContactList,
  deleteContactList,
} from "./reducer";
import api from "@src/utils/axios_api";
import { CrmContactItems } from "@src/dtos/apps/crm";
import { REACT_APP_CRM_CONTACT_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";
import UpdateToast from "@src/components/custom/toast/updateToast";

const CONTACT_LIST_API = REACT_APP_CRM_CONTACT_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get contact
export const getContactData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-crm-contact-list");
      if (!responseData) {
        const response = await api.get(CONTACT_LIST_API);
        createLocalStorage("d-crm-contact-list", response);
        dispatch(getContactList(response));
      } else {
        dispatch(getContactList(responseData));
      }
    } else {
      const response = await api.get(CONTACT_LIST_API);
      dispatch(getContactList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Contact List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching contact data:", error);
  }
};

// add contact record
export const addContactListData =
  (newRecord: CrmContactItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(CONTACT_LIST_API, newRecord, "Contact");
      const { message } = response;
      AddToast(message || "Contact record added successfully");
      addLocalStorageRecord("d-crm-contact-list", newRecord);
      dispatch(addContactList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding contact record:", error);
    }
  };

// edit contact record
export const editContactListData =
  (question: CrmContactItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(CONTACT_LIST_API, question, "Contact");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Contact record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-crm-contact-list", question);
      dispatch(editContactList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record updation failed";
      ErrorToast(errorMessage);
      console.error("Error adding contact record:", error);
    }
  };

// delete customer record
export const deleteContactListData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(CONTACT_LIST_API, _id, "Contact");
        const { message } = response;
        DeleteToast(message || "Deal record deleted successfully");
        return _id;
      });

      const deletedContacts = await Promise.all(deletePromises);
      dispatch(deleteContactList(deletedContacts));
      deleteLocalStorageRecord({
        key: "d-crm-contact-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting contact: ", error);
    }
  };
