import { AppDispatch } from "src/slices/reducer";
import {
  addExamList,
  deleteExamList,
  editExamList,
  getExamList,
} from "./reducer";
import { ExamSchedule } from "@dtos/index";
import api from "@src/utils/axios_api";
import { REACT_APP_SCHOOL_EXAM_SCHEDULE_LIST } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";
import ErrorToast from "@src/components/custom/toast/errorToast";

const SCHOOL_EXAM_LIST = REACT_APP_SCHOOL_EXAM_SCHEDULE_LIST;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get exam list
export const getExamListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-exam-schedule");
      if (!responseData) {
        const response = await api.get(SCHOOL_EXAM_LIST);
        createLocalStorage("d-exam-schedule", response);
        dispatch(getExamList(response));
      } else {
        dispatch(getExamList(responseData));
      }
    } else {
      const response = await api.get(SCHOOL_EXAM_LIST);
      dispatch(getExamList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "exam schedule Fetch Failed";
    ErrorToast(errorMessage);
    console.error("Error fetching exam schedule data:", error);
  }
};

// add exam record
export const addExamListData =
  (newRecord: ExamSchedule) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(SCHOOL_EXAM_LIST, newRecord, "Exam List");
      const { message } = response;
      AddToast(message);
      addLocalStorageRecord("d-exam-schedule", newRecord);
      dispatch(addExamList(newRecord || "exam record added successfully"));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "exam addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding record:", error);
    }
  };

// edit exam record
export const editExamListData =
  (question: ExamSchedule) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(SCHOOL_EXAM_LIST, question, "Exam List");
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "exam record updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-exam-schedule", question);
      dispatch(editExamList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Exam record updation failed";
      ErrorToast(errorMessage);
      console.error("Error updating record:", error);
    }
  };

// delete exam record
export const deleteExamListData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(SCHOOL_EXAM_LIST, _id, "Exam List");
        const { message } = response;
        DeleteToast(message || "exam record deleted successfully");
        return _id;
      });

      const deletedExamList = await Promise.all(deletePromises);
      dispatch(deleteExamList(deletedExamList));
      deleteLocalStorageRecord({
        key: "d-exam-schedule",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "exam record deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting exam: ", error);
    }
  };
