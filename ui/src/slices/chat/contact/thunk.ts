import api from "@src/utils/axios_api";
import { AppDispatch } from "@src/slices/reducer";
import {
  getContactChatList,
  deleteContactChatList,
  editContactChatRecord,
  addContactChatRecord,
} from "./reducer";
import { ContactChatRecord } from "@src/dtos";
import {
  addLocalStorageRecord,
  deleteLocalStorageRecord,
  createLocalStorage,
  updateLocalStorageRecord,
  getLocalStorage,
} from "@src/utils/crud_functions";
import { REACT_APP_CONTACT_CHAT_API } from "@src/utils/url_helper";
import ErrorToast from "@src/components/custom/toast/errorToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import AddToast from "@src/components/custom/toast/addToast";

const CONTACT_CHAT_LIST_API = REACT_APP_CONTACT_CHAT_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get contact list
export const getContactChatData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-contact-chat-list");
      if (!responseData) {
        const response = await api.get(CONTACT_CHAT_LIST_API);
        createLocalStorage("d-contact-chat-list", response);
        dispatch(getContactChatList(response));
      } else {
        dispatch(getContactChatList(responseData));
      }
    } else {
      const response = await api.get(CONTACT_CHAT_LIST_API);
      dispatch(getContactChatList(response));
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

// delete contact record
export const deleteContactChatData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          CONTACT_CHAT_LIST_API,
          _id,
          "Contact",
        );
        const { message } = response;
        DeleteToast(message || "Contact record deleted successfully");
        return _id;
      });

      const deletedContacts = await Promise.all(deletePromises);
      dispatch(deleteContactChatList(deletedContacts));
      deleteLocalStorageRecord({
        key: "d-contact-chat-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting contact record: ", error);
    }
  };

// edit contact record
export const editContactChatRecordData =
  (question: ContactChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        CONTACT_CHAT_LIST_API,
        question,
        "Contact",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Contact record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-contact-chat-list", question);
      dispatch(editContactChatRecord(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating contact record:", error);
    }
  };

// add contact record
export const addContactChatRecordData =
  (newRecord: ContactChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        CONTACT_CHAT_LIST_API,
        newRecord,
        "Contact",
      );
      const { message } = response;
      AddToast(message || "Contact record added successfully");
      addLocalStorageRecord("d-contact-chat-list", newRecord);
      dispatch(addContactChatRecord(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Contact record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding contact record:", error);
    }
  };
