import { AppDispatch } from "@src/slices/reducer";
import api from "@src/utils/axios_api";
import { Holidays } from "@src/dtos/apps/holidays";
import {
  addHolidays,
  deleteHolidays,
  editHolidays,
  getHolidays,
} from "./reducer";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { REACT_APP_HOSPITAL_HOLIDAYS_API } from "@src/utils/url_helper";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const HOSPITAL_HOLIDAYS_API = REACT_APP_HOSPITAL_HOLIDAYS_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

//get Holidays
export const getHolidaysData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-hospital-holidays");
      if (!responseData) {
        const response = await api.get(HOSPITAL_HOLIDAYS_API);
        createLocalStorage("d-hospital-holidays", response);
        dispatch(getHolidays(response));
      } else {
        dispatch(getHolidays(responseData));
      }
    } else {
      const response = await api.get(HOSPITAL_HOLIDAYS_API);
      dispatch(getHolidays(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Holidays List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching Holidays data:", error);
  }
};

//add Holidays
export const addHolidaysData =
  (newRecord: Holidays) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        HOSPITAL_HOLIDAYS_API,
        newRecord,
        "Holidays",
      );
      const { message } = response;
      AddToast(message || "Holidays record added successfully");
      addLocalStorageRecord("d-hospital-holidays", newRecord);
      dispatch(addHolidays(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Holidays addition failed";
      ErrorToast(errorMessage);
      console.error("Error in holidays adding record:", error);
    }
  };

//edit Holidays
export const editHolidaysData =
  (appointment: Holidays) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        HOSPITAL_HOLIDAYS_API,
        appointment,
        "Holidays",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Holidays updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-hospital-holidays", appointment);
      dispatch(editHolidays(appointment));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Holidays update failed";
      ErrorToast(errorMessage);
      console.error("Error updating holidays record:", error);
    }
  };

// delete Holidays
export const deleteHolidaysData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          HOSPITAL_HOLIDAYS_API,
          _id,
          "Holidays",
        );
        const { message } = response;
        DeleteToast(message || "Holidays deleted successfully");
        return _id;
      });

      const deletedHolidays = await Promise.all(deletePromises);
      dispatch(deleteHolidays(deletedHolidays));
      deleteLocalStorageRecord({
        key: "d-hospital-holidays",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Holidays deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in holidays: ", error);
    }
  };
