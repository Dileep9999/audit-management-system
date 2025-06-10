import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { LibraryBook } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface LibraryState {
  bookList: LibraryBook[] | null;
  isLoading: boolean;
}

const initialState: LibraryState = {
  bookList: initStore("d-library-books"),
  isLoading: false,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    //get book List
    getBookList(state, action: PayloadAction<LibraryBook[]>) {
      state.bookList = action.payload;
    },

    //add book
    addBookList(state, action: PayloadAction<LibraryBook>) {
      const newBook = action.payload;
      if (state.bookList !== null) {
        state.bookList.unshift(newBook);
      } else {
        state.bookList = [newBook];
      }
    },

    //edit book
    editBookList(state, action: PayloadAction<LibraryBook>) {
      const book = action.payload;
      if (state.bookList !== null) {
        const findBookIndex = state.bookList.findIndex(
          (item) => item._id === book._id,
        );
        const findBookRecord = state.bookList.find(
          (item) => item._id === book._id,
        );
        if (findBookIndex !== -1 && findBookRecord) {
          state.bookList[findBookIndex] = book;
        }
        LoadingToast();
      }
    },

    //delete book
    deleteBookList(state, action: PayloadAction<number[]>) {
      if (state.bookList !== null) {
        state.bookList = state.bookList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const { getBookList, addBookList, editBookList, deleteBookList } =
  librarySlice.actions;

export default librarySlice.reducer;
