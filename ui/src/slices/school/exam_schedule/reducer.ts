import { ExamSchedule } from "@dtos/index";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { initStore } from "@src/utils/init_store";

interface ExamScheduleState {
  examSchedule: ExamSchedule[] | null;
  isLoading: boolean;
}

const initialState: ExamScheduleState = {
  examSchedule: initStore("d-exam-schedule"),
  isLoading: false,
};

const examScheduleSlice = createSlice({
  name: "examSchedule",
  initialState,
  reducers: {
    //get book List
    getExamList(state, action: PayloadAction<ExamSchedule[]>) {
      state.examSchedule = action.payload;
    },

    //add book
    addExamList(state, action: PayloadAction<ExamSchedule>) {
      const newExam = action.payload;
      if (state.examSchedule !== null) {
        state.examSchedule.unshift(newExam);
      } else {
        state.examSchedule = [newExam];
      }
    },

    //edit book
    editExamList(state, action: PayloadAction<ExamSchedule>) {
      const exam = action.payload;
      if (state.examSchedule !== null) {
        const findExamIndex = state.examSchedule.findIndex(
          (item) => item._id === exam._id,
        );
        const findExamRecord = state.examSchedule.find(
          (item) => item._id === exam._id,
        );
        if (findExamIndex !== -1 && findExamRecord) {
          state.examSchedule[findExamIndex] = exam;
          LoadingToast();
        }
      }
    },

    //delete book
    deleteExamList(state, action: PayloadAction<number[]>) {
      if (state.examSchedule !== null) {
        state.examSchedule = state.examSchedule.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const { getExamList, addExamList, editExamList, deleteExamList } =
  examScheduleSlice.actions;

export default examScheduleSlice.reducer;
