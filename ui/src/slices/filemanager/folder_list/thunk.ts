import { REACT_APP_FILE_MANAGER_FOLDER_API } from "@src/utils/url_helper";
import {
  deleteFolderList,
  editFolderList,
  getFolderList,
  addFolderList,
} from "./reducer";
import api from "@src/utils/axios_api";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { FolderListRecord } from "@src/dtos/apps/filemanager";
import { AppDispatch } from "@src/slices/reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const FOLDER_LIST_API = REACT_APP_FILE_MANAGER_FOLDER_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get folder list
export const getFolderListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-folder-list");
      if (!responseData) {
        const response = await api.get(FOLDER_LIST_API);
        createLocalStorage("d-folder-list", response);
        dispatch(getFolderList(response));
      } else {
        dispatch(getFolderList(responseData));
      }
    } else {
      const response = await api.get(FOLDER_LIST_API);
      dispatch(getFolderList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Folder List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching folder data:", error);
  }
};

//  delete Folder
export const deleteFolderData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(FOLDER_LIST_API, _id, "Folder");
        const { message } = response;
        DeleteToast(message || "Folder deleted successfully");
        return _id;
      });

      const deletedQuestions = await Promise.all(deletePromises);
      dispatch(deleteFolderList(deletedQuestions));
      deleteLocalStorageRecord({
        key: "d-folder-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Folder record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting folder: ", error);
    }
  };

// edit folder record
export const editFolderRecordData =
  (question: FolderListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(FOLDER_LIST_API, question, "Folder");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Folder updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-folder-list", question);
      dispatch(editFolderList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Folder record update failed";
      ErrorToast(errorMessage);
      console.error("Error updating folder record:", error);
    }
  };

// add folder record
export const addFolderRecordData =
  (newRecord: FolderListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(FOLDER_LIST_API, newRecord, "Folder");
      const { message } = response;
      AddToast(message || "Exam question added successfully");
      addLocalStorageRecord("d-folder-list", newRecord);
      dispatch(addFolderList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Folder record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding folder record:", error);
    }
  };
