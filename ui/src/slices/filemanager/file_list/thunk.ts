import { REACT_APP_FILE_MANAGER_API } from "@src/utils/url_helper";
import { deleteFileList, editFileList, getFileList } from "./reducer";
import api from "@src/utils/axios_api";
import {
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { FileListRecord } from "@src/dtos/apps/filemanager";
import { AppDispatch } from "@src/slices/reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const FILE_LIST_API = REACT_APP_FILE_MANAGER_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get file data
export const getFileListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-file-list");
      if (!responseData) {
        const response = await api.get(FILE_LIST_API);
        createLocalStorage("d-file-list", response);
        dispatch(getFileList(response));
      } else {
        dispatch(getFileList(responseData));
      }
    } else {
      const response = await api.get(FILE_LIST_API);
      dispatch(getFileList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "File List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching file data:", error);
  }
};

//  delete file
export const deleteFileData =
  (files: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = files.map(async (_id) => {
        const response = await api.delete(FILE_LIST_API, _id, "File");
        const { message } = response;
        DeleteToast(message || "File deleted successfully");
        return _id;
      });

      const deletedFiles = await Promise.all(deletePromises);
      dispatch(deleteFileList(deletedFiles));
      deleteLocalStorageRecord({
        key: "d-file-list",
        listRecord: files,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "File record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting file : ", error);
    }
  };

// edit customer record
export const editFileRecordData =
  (question: FileListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(FILE_LIST_API, question, "File");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "File updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-file-list", question);
      dispatch(editFileList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "File record update failed";
      ErrorToast(errorMessage);
      console.error("Error updating file record:", error);
    }
  };
