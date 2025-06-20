import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";

import { FolderListRecord } from "@src/dtos/apps/filemanager";
import { initStore } from "@src/utils/init_store";

interface FolderStates {
  folderList: FolderListRecord[] | null;
  isLoading: boolean;
}

const initialState: FolderStates = {
  folderList: initStore("d-folder-list"),
  isLoading: false,
};

const folderListSlice = createSlice({
  name: "folderList",
  initialState,
  reducers: {
    // get folderList data
    getFolderList(state, action: PayloadAction<FolderListRecord[]>) {
      state.folderList = action.payload;
    },

    // delete folders
    deleteFolderList(state, action: PayloadAction<number[]>) {
      if (state.folderList !== null) {
        state.folderList = state.folderList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // edit folderList data
    editFolderList(state, action: PayloadAction<FolderListRecord>) {
      const folder = action.payload;
      if (state.folderList !== null) {
        const findFolderIndex = state.folderList.findIndex(
          (item) => item._id === folder._id,
        );
        const findFolderRecord = state.folderList.find(
          (item) => item._id === folder._id,
        );
        if (findFolderIndex !== -1 && findFolderRecord) {
          state.folderList[findFolderIndex] = folder;
          LoadingToast();
        }
      }
    },

    // Add folders
    addFolderList(state, action: PayloadAction<FolderListRecord>) {
      const newRecord = action.payload;
      if (newRecord !== null) {
        state.folderList?.unshift(newRecord);
      } else {
        state.folderList = [newRecord];
      }
    },
  },
});

export const {
  getFolderList,
  deleteFolderList,
  editFolderList,
  addFolderList,
} = folderListSlice.actions;
export default folderListSlice.reducer;
