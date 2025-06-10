import { AppDispatch } from "@src/slices/reducer";
import {
  getMail,
  addMail,
  deleteMail,
  editMail,
  setCurrentEmail,
} from "./reducer";
import api from "@src/utils/axios_api";
import { REACT_APP_EMAIL_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { Email } from "@src/dtos";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const EMAIL_LIST_API = REACT_APP_EMAIL_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get mail data
export const getMailData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-email-list");
      if (!responseData) {
        const response = await api.get(EMAIL_LIST_API);
        createLocalStorage("d-email-list", response);
        dispatch(getMail(response));
      } else {
        dispatch(getMail(responseData));
      }
    } else {
      const response = await api.get(EMAIL_LIST_API);
      dispatch(getMail(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Email List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching email data:", error);
  }
};

// delete mail record
export const deleteMailData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(EMAIL_LIST_API, _id, "Email");
        const { message } = response;
        DeleteToast(message || "Email deleted successfully");
        return _id;
      });

      const deletedEmails = await Promise.all(deletePromises);
      dispatch(deleteMail(deletedEmails));
      deleteLocalStorageRecord({
        key: "d-email-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email record deletion failed ";
      ErrorToast(errorMessage);
      console.error("Error in deleting email: ", error);
    }
  };

// add email record
export const addEmailListRecordData =
  (newRecord: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(EMAIL_LIST_API, newRecord, "Email");
      const { message } = response;
      AddToast(message || "Email record added successfully");
      addLocalStorageRecord("d-email-list", newRecord);
      dispatch(addMail(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding email record:", error);
    }
  };

// edit mail record
export const editEmailListRecordData =
  (question: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(EMAIL_LIST_API, question, "Email");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Email record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-email-list", question);
      dispatch(editMail(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email record updation failed";
      ErrorToast(errorMessage);
      console.error("Error adding email record:", error);
    }
  };

// set current email record
export const setCurrentEmailRecordData =
  (email: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: email };
      const { data } = response;
      dispatch(setCurrentEmail(data));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email record current set failed";
      ErrorToast(errorMessage);
      console.error("Error current set record:", error);
    }
  };
