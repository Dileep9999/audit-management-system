import { AppDispatch } from "@src/slices/reducer";
import { Patients } from "@src/dtos";
import api from "@src/utils/axios_api";
import {
  getPatients,
  addPatients,
  editPatients,
  deletePatients,
  setCurrentPatients,
} from "./reducer";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import { REACT_APP_HOSPITAL_PATIENTS_LIST_API } from "@src/utils/url_helper";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const HOSPITAL_PATIENTS_API = REACT_APP_HOSPITAL_PATIENTS_LIST_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get patients data
export const getPatientsData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-hospital-patients-list");
      if (!responseData) {
        const response = await api.get(HOSPITAL_PATIENTS_API);
        createLocalStorage("d-hospital-patients-list", response);
        dispatch(getPatients(response));
      } else {
        dispatch(getPatients(responseData));
      }
    } else {
      const response = await api.get(HOSPITAL_PATIENTS_API);
      dispatch(getPatients(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Patients List Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching patients data:", error);
  }
};

// add new patients
export const addPatientsData =
  (newRecord: Patients) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        HOSPITAL_PATIENTS_API,
        newRecord,
        "Patients",
      );
      const { message } = response;
      AddToast(message || "Patients record added successfully");
      addLocalStorageRecord("d-hospital-patients-list", newRecord);
      dispatch(addPatients(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Patients addition failed";
      ErrorToast(errorMessage);
      console.error("Error in patients adding record:", error);
    }
  };

// edit patients
export const editPatientsData =
  (appointment: Patients) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        HOSPITAL_PATIENTS_API,
        appointment,
        "Patient",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Patient updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-hospital-patients-list", appointment);
      dispatch(editPatients(appointment));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Patient update failed";
      ErrorToast(errorMessage);
      console.error("Error updating patient record:", error);
    }
  };

// delete patients
export const deletePatientsData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          HOSPITAL_PATIENTS_API,
          _id,
          "Patient",
        );
        const { message } = response;
        DeleteToast(message || "Patient deleted successfully");
        return _id;
      });

      const deletedPatients = await Promise.all(deletePromises);
      dispatch(deletePatients(deletedPatients));
      deleteLocalStorageRecord({
        key: "d-hospital-patients-list",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Patient deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in patient: ", error);
    }
  };

// update current patients
export const modifyCurrentPatients =
  (modifyPatint: Patients, patientMode: boolean) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { data: modifyPatint, editMode: patientMode };
      dispatch(
        setCurrentPatients({
          patient: response.data,
          mode: response.editMode,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };
