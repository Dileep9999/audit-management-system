import { AppDispatch } from "@src/slices/reducer";
import {
  getEventGrid,
  addEventGrid,
  editEventGrid,
  deleteEventGrid,
} from "./reducer";
import { EventGrid } from "@src/dtos";
import api from "@src/utils/axios_api";
import { REACT_APP_EVENT_GRID_API } from "@src/utils/url_helper";
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

const EVENT_GRID_API = REACT_APP_EVENT_GRID_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get event grid data
export const getEventGridData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-events-grid");
      if (!responseData) {
        const response = await api.get(EVENT_GRID_API);
        createLocalStorage("d-events-grid", response);
        dispatch(getEventGrid(response));
      } else {
        dispatch(getEventGrid(responseData));
      }
    } else {
      const response = await api.get(EVENT_GRID_API);
      dispatch(getEventGrid(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Event Grid List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching event grid data:", error);
  }
};

// add new event grid
export const addEventGridData =
  (newRecord: EventGrid) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(EVENT_GRID_API, newRecord, "Event Grid");
      const { message } = response;
      AddToast(message || "Event Grid record added successfully");
      addLocalStorageRecord("d-events-grid", newRecord);
      dispatch(addEventGrid(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Event grid addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding event grid record:", error);
    }
  };

// edit event grid
export const editEventGridData =
  (event: EventGrid) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(EVENT_GRID_API, event, "Event Grid");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Event Grid updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-events-grid", event);
      dispatch(editEventGrid(event));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Event Grid record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating event grid record:", error);
    }
  };

// delete event grid
export const deleteEventGridtData =
  (event: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = event.map(async (_id) => {
        const response = await api.delete(EVENT_GRID_API, _id, "Event Grid");
        const { message } = response;
        DeleteToast(message || "Event Grid record deleted successfully");
        return _id;
      });

      const deletedEventGrid = await Promise.all(deletePromises);
      dispatch(deleteEventGrid(deletedEventGrid));
      deleteLocalStorageRecord({
        key: "d-events-grid",
        listRecord: event,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Exam Grid deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting event grid: ", error);
    }
  };
