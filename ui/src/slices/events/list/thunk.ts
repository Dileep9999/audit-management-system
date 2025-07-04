import { AppDispatch } from "@src/slices/reducer";
import {
  getEventList,
  editEventList,
  addEventList,
  deleteEventList,
} from "./reducer";
import { EventList } from "@src/dtos";
import api from "@src/utils/axios_api";
import { REACT_APP_EVENT_LIST_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const EVENT_lIST_API = REACT_APP_EVENT_LIST_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get event list data
export const getEventListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-events-list");
      if (!responseData) {
        const response = await api.get(EVENT_lIST_API);
        createLocalStorage("d-events-list", response);
        dispatch(getEventList(response));
      } else {
        dispatch(getEventList(responseData));
      }
    } else {
      const response = await api.get(EVENT_lIST_API);
      dispatch(getEventList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Event List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching exam event list data:", error);
  }
};

// add new event list
export const addEventListData =
  (newRecord: EventList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(EVENT_lIST_API, newRecord, "Event List");
      const { message } = response;
      AddToast(message || "Event List record added successfully");
      addLocalStorageRecord("d-events-list", newRecord);
      dispatch(addEventList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Event List addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding event list record:", error);
    }
  };

// edit event list
export const editEventListData =
  (event: EventList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(EVENT_lIST_API, event, "Event List");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Event List updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-events-list", event);
      dispatch(editEventList(event));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Event List record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating event list record:", error);
    }
  };

// delete event list
export const deleteEventListData =
  (event: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = event.map(async (_id) => {
        const response = await api.delete(EVENT_lIST_API, _id, "Event List");
        const { message } = response;
        DeleteToast(message || "Event List record deleted successfully");
        return _id;
      });

      const deletedEventList = await Promise.all(deletePromises);
      dispatch(deleteEventList(deletedEventList));
      deleteLocalStorageRecord({
        key: "d-events-list",
        listRecord: event,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Event List deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting event list: ", error);
    }
  };
