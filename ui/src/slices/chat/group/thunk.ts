import api from "@src/utils/axios_api";
import { AppDispatch } from "@src/slices/reducer";
import {
  getGroupChatList,
  setCurrentGroupChatRecord,
  deleteGroupChatListRecord,
  editGroupChatListRecord,
  addGroupChatListRecord,
  addNewGroupChatMessage,
  deleteGroupChatMessage,
} from "./reducer";
import {
  addLocalStorageRecord,
  deleteLocalStorageRecord,
  createLocalStorage,
  updateLocalStorageRecord,
  getLocalStorage,
} from "@src/utils/crud_functions";
import { GroupChatMessage, GroupChatRecord } from "@src/dtos";
import { REACT_APP_GROUP_CHAT_API } from "@src/utils/url_helper";
import AddToast from "@src/components/custom/toast/addToast";
import ErrorToast from "@src/components/custom/toast/errorToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const DEFAULT_GROUP_CHAT_LIST_API = REACT_APP_GROUP_CHAT_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get customer list
export const getGroupChatData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-group-chat");
      if (!responseData) {
        const response = await api.get(DEFAULT_GROUP_CHAT_LIST_API);
        createLocalStorage("d-group-chat", response);
        dispatch(getGroupChatList(response));
      } else {
        dispatch(getGroupChatList(responseData));
      }
    } else {
      const response = await api.get(DEFAULT_GROUP_CHAT_LIST_API);
      dispatch(getGroupChatList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Group Chat List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching group chat data:", error);
  }
};

// set current chat record
export const setCurrentGroupChatListRecord =
  (chat: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: chat };
      dispatch(setCurrentGroupChatRecord(response.data));
    } catch (error) {
      console.error("Error setting current chat record:", error);
    }
  };

// add new Chat
export const addGroupChatRecordData =
  (newRecord: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        DEFAULT_GROUP_CHAT_LIST_API,
        newRecord,
        "Group Chat",
      );
      const { message } = response;
      AddToast(message || "Chat record added successfully");
      addLocalStorageRecord("d-group-chat", newRecord);
      dispatch(addGroupChatListRecord(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Group Chat record addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding group chat record:", error);
    }
  };

// delete current chat
export const deleteGroupChatRecordData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          DEFAULT_GROUP_CHAT_LIST_API,
          _id,
          "Group Chat",
        );
        const { message } = response;
        DeleteToast(message || "Group Chat record deleted successfully");
        return _id;
      });

      const deletedGroupChat = await Promise.all(deletePromises);
      dispatch(deleteGroupChatListRecord(deletedGroupChat));
      deleteLocalStorageRecord({
        key: "d-group-chat",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Group Chat record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting group chat record: ", error);
    }
  };

// edit customer record
export const editGroupChatListRecordData =
  (question: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        DEFAULT_GROUP_CHAT_LIST_API,
        question,
        "Chat",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Chat record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-group-chat", question);
      dispatch(editGroupChatListRecord(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Group Chat record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating group chat record:", error);
    }
  };

// add new message
export const addGroupChatMessageRecord =
  (userId: number, newMessage: GroupChatMessage) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { _id: userId, message: newMessage };
      dispatch(
        addNewGroupChatMessage({
          _id: response._id,
          message: response.message,
        }),
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Chat record addition failed";
      ErrorToast(errorMessage || "Chat record addition failed");
      console.error("Error adding group chat record:", error);
    }
  };

// delete message
export const deleteGroupChatMessageRecord =
  (userId: number, deletedMessage: GroupChatMessage) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { _id: userId, message: deletedMessage };
      dispatch(
        deleteGroupChatMessage({
          _id: response._id,
          message: response.message,
        }),
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Chat record deletion failed";
      ErrorToast(errorMessage || "Chat record deletion failed");
      console.error("Error deleting group chat record:", error);
    }
  };
