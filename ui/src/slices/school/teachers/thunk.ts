import { AppDispatch } from "@src/slices/reducer";
import api from "@src/utils/axios_api";
import { TeacherListList } from "@src/dtos";
import { REACT_APP_SCHOOL_TEACHER_LIST_API } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import {
  addTeacherList,
  deleteTeacherList,
  editTeacherList,
  getTeacherList,
} from "./reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const SCHOOL_TEACHER_LIST_API = REACT_APP_SCHOOL_TEACHER_LIST_API;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get teacher list
export const getTeacherListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-teacher-list");
      if (!responseData) {
        const response = await api.get(SCHOOL_TEACHER_LIST_API);
        createLocalStorage("d-teacher-list", response);
        dispatch(getTeacherList(response));
      } else {
        dispatch(responseData);
      }
    } else {
      const response = await api.get(SCHOOL_TEACHER_LIST_API);
      dispatch(getTeacherList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Teacher List Fetch Failed.";
    ErrorToast(errorMessage);
    console.error("Error fetching teacher list data:", error);
  }
};

// add teacher record
export const addTeacherListData =
  (newRecord: TeacherListList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        SCHOOL_TEACHER_LIST_API,
        newRecord,
        "Teacher List",
      );
      const { message } = response;
      AddToast(message || "Teacher List added successfully");
      addLocalStorageRecord("d-teacher-list", newRecord);
      dispatch(addTeacherList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Teacher List addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding teacher list record:", error);
    }
  };

// edit teacher record
export const editTeacherListData =
  (teacher: TeacherListList) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        SCHOOL_TEACHER_LIST_API,
        teacher,
        "Teacher List",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Teacher List updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-teacher-list", teacher);
      dispatch(editTeacherList(teacher));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Teacher List record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating teacher list:", error);
    }
  };

// delete teacher record
export const deleteTeacherListData =
  (teacher: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = teacher.map(async (_id) => {
        const response = await api.delete(
          SCHOOL_TEACHER_LIST_API,
          _id,
          "Teacher List",
        );
        const { message } = response;
        DeleteToast(message || "Teacher record deleted successfully");
        return _id;
      });

      const deletedTeachers = await Promise.all(deletePromises);
      dispatch(deleteTeacherList(deletedTeachers));
      deleteLocalStorageRecord({
        key: "d-teacher-list",
        listRecord: teacher,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Teacher List record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting teacher list: ", error);
    }
  };
