import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initStore } from "@src/utils/init_store";
import { TeacherListList } from "@src/dtos";
import LoadingToast from "@src/components/custom/toast/loadingToast";

interface TeacherListState {
  teacherList: TeacherListList[] | null;
  isLoading: boolean;
}

const initialState: TeacherListState = {
  teacherList: initStore("d-teacher-list"),
  isLoading: false,
};

const teacherListSlice = createSlice({
  name: "teacherList",
  initialState,
  reducers: {
    //get teacher list
    getTeacherList(state, action: PayloadAction<TeacherListList[]>) {
      state.teacherList = action.payload;
    },

    //add teacher
    addTeacherList(state, action: PayloadAction<TeacherListList>) {
      const newStaff = action.payload;
      if (state.teacherList !== null) {
        state.teacherList.unshift(newStaff);
      } else {
        state.teacherList = [newStaff];
      }
    },

    //edit teacher list
    editTeacherList(state, action: PayloadAction<TeacherListList>) {
      const teacher = action.payload;
      if (state.teacherList !== null) {
        const findTeacherIndex = state.teacherList.findIndex(
          (item) => item._id === teacher._id,
        );
        const findTeacherRecord = state.teacherList.find(
          (item) => item._id === teacher._id,
        );
        if (findTeacherIndex !== -1 && findTeacherRecord) {
          state.teacherList[findTeacherIndex] = teacher;
        }
        LoadingToast();
      }
    },

    //delete teacher record
    deleteTeacherList(state, action: PayloadAction<number[]>) {
      if (state.teacherList !== null) {
        state.teacherList = state.teacherList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getTeacherList,
  addTeacherList,
  editTeacherList,
  deleteTeacherList,
} = teacherListSlice.actions;

export default teacherListSlice.reducer;
