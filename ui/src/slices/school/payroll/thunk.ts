import { AppDispatch } from "@src/slices/reducer";
import api from "@src/utils/axios_api";
import { REACT_APP_SCHOOL_TEACHER_PAYROLL_LIST_API } from "@src/utils/url_helper";
import { createLocalStorage, getLocalStorage } from "@src/utils/crud_functions";
import { getPayrollList } from "./reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";

const SCHOOL_TEACHER_PAYROLL_API = REACT_APP_SCHOOL_TEACHER_PAYROLL_LIST_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get teacher payroll list
export const getPayrollListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-teacher-payroll");
      if (!responseData) {
        const response = await api.get(SCHOOL_TEACHER_PAYROLL_API);
        createLocalStorage("d-teacher-payroll", response);
        dispatch(getPayrollList(response));
      } else {
        dispatch(getPayrollList(responseData));
      }
    } else {
      const response = await api.get(SCHOOL_TEACHER_PAYROLL_API);
      dispatch(getPayrollList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Teacher Payroll List Fetch Failed.";
    ErrorToast(errorMessage);
    console.error("Error fetching teacher payroll List data:", error);
  }
};
