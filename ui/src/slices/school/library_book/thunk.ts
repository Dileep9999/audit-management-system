import { AppDispatch } from "@src/slices/reducer";
import api from "@src/utils/axios_api";
import { LibraryBook } from "@src/dtos";
import { REACT_APP_SCHOOL_LIBRARY_BOOK_LIST } from "@src/utils/url_helper";
import {
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from "@src/utils/crud_functions";
import {
  addBookList,
  deleteBookList,
  editBookList,
  getBookList,
} from "./reducer";
import ErrorToast from "@src/components/custom/toast/errorToast";
import AddToast from "@src/components/custom/toast/addToast";
import UpdateToast from "@src/components/custom/toast/updateToast";
import DeleteToast from "@src/components/custom/toast/deleteToast";

const SCHOOL_LIBRARY_BOOK_LIST = REACT_APP_SCHOOL_LIBRARY_BOOK_LIST;
const IsApi = import.meta.env.VITE_REACT_APP_IS_API_ACTIVE === "true";

// get book list
export const getBookListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage("d-library-books");
      if (!responseData) {
        const response = await api.get(SCHOOL_LIBRARY_BOOK_LIST);
        createLocalStorage("d-library-books", response);
        dispatch(getBookList(response));
      } else {
        dispatch(getBookList(responseData));
      }
    } else {
      const response = await api.get(SCHOOL_LIBRARY_BOOK_LIST);
      dispatch(getBookList(response));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Book List Fetch Failed.";
    ErrorToast(errorMessage);
    console.error("Error fetching Book list data:", error);
  }
};

// add book record
export const addBookListData =
  (newRecord: LibraryBook) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(
        SCHOOL_LIBRARY_BOOK_LIST,
        newRecord,
        "Book",
      );
      const { message } = response;
      AddToast(message || "Book added successfully");
      addLocalStorageRecord("d-library-books", newRecord);
      dispatch(addBookList(newRecord));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Book addition failed";
      ErrorToast(errorMessage);
      console.error("Error adding book record:", error);
    }
  };

// edit book record
export const editBookListData =
  (question: LibraryBook) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        SCHOOL_LIBRARY_BOOK_LIST,
        question,
        "Book",
      );
      const { message } = response;
      setTimeout(() => {
        UpdateToast(message || "Book updated successfully");
      }, 2000);
      updateLocalStorageRecord("d-library-books", question);
      dispatch(editBookList(question));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Book update failed";
      ErrorToast(errorMessage);
      console.error("Error updating book record:", error);
    }
  };

// delete book record
export const deleteBookListData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (_id) => {
        const response = await api.delete(
          SCHOOL_LIBRARY_BOOK_LIST,
          _id,
          "Book",
        );
        const { message } = response;
        DeleteToast(message || "Book record deleted successfully");
        return _id;
      });

      const deletedBooks = await Promise.all(deletePromises);
      dispatch(deleteBookList(deletedBooks));
      deleteLocalStorageRecord({
        key: "d-library-books",
        listRecord: question,
        multipleRecords: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Book deletion failed";
      ErrorToast(errorMessage);
      console.error("Error in deleting books: ", error);
    }
  };
