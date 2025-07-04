import { AppDispatch } from "@src/slices/reducer";
import { employeeSalary } from "@src/dtos";
import api from "@src/utils/axios_api";
import {
  addEmaployeeSalary,
  deleteEmaployeeSalary,
  editEmaployeeSalary,
  getEmaployeeSalary,
} from "./reducer";
import { REACT_APP_HOSPITAL_EMPLOYEE_SALARY } from "@src/utils/url_helper";
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

const HOSPITAL_EMPLOYEE_SALARY_API = REACT_APP_HOSPITAL_EMPLOYEE_SALARY;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

//get salary records
export const getEmployeeSalaryData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-hospital-employee-salary");
      if (!responseData) {
        const response = await api.get(HOSPITAL_EMPLOYEE_SALARY_API);
        createLocalStorage("d-hospital-employee-salary", response);
        dispatch(getEmaployeeSalary(response));
      } else {
        dispatch(getEmaployeeSalary(responseData));
      }
    } else {
      const response = await api.get(HOSPITAL_EMPLOYEE_SALARY_API);
      dispatch(getEmaployeeSalary(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Employee Salary Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching employee Salary data:", error);
  }
};

//add salary records
export const addEmployeeSalaryData =
  (newRecord: employeeSalary) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        HOSPITAL_EMPLOYEE_SALARY_API,
        newRecord,
        "Salary",
      );
      const { message } = response;
      AddToast(message || "Salary record added successfully");
      addLocalStorageRecord("d-hospital-department", newRecord);
      dispatch(addEmaployeeSalary(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Salary addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding employee salary record:", error);
    }
  };

// edite salary records
export const editEmployeeSalaryData =
  (appointment: employeeSalary) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        HOSPITAL_EMPLOYEE_SALARY_API,
        appointment,
        "Salary",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Salary updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-hospital-employee-salary", appointment);
      dispatch(editEmaployeeSalary(appointment));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Salary update failed";
      ErrorToast(errorMessage);
      console.error("Error updating salary record:", error);
    }
  };

//delete salary records
export const deleteEmployeeSalaryData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          HOSPITAL_EMPLOYEE_SALARY_API,
          _id,
          "Salary",
        );
        const { message } = response;
        DeleteToast(message || "Salary deleted successfully");
        return _id;
      });

      const deletedSalary = await Promise.all(deletePromises);
      dispatch(deleteEmaployeeSalary(deletedSalary));
      deleteLocalStorageRecord({
        key: "d-hospital-employee-salary",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Salary deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in salary: ", error);
    }
  };
