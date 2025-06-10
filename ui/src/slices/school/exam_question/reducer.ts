import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initStore } from "@src/utils/init_store";
import { ExamQuestion } from "@src/dtos";
import LoadingToast from "@src/components/custom/toast/loadingToast";

interface ExamQuestionState {
  examQuestion: ExamQuestion[] | null;
  isLoading: boolean;
}

const initialState: ExamQuestionState = {
  examQuestion: initStore("d-exam-question"),
  // examQuestion: [],
  isLoading: false,
};

const questionSlice = createSlice({
  name: "examQuestion",
  initialState,
  reducers: {
    //get Question List
    getQuestionList(state, action: PayloadAction<ExamQuestion[]>) {
      state.examQuestion = action.payload;
    },

    //add Question
    addQuestionList(state, action: PayloadAction<ExamQuestion>) {
      const newQustion = action.payload;
      if (state.examQuestion !== null) {
        state.examQuestion.unshift(newQustion);
      } else {
        state.examQuestion = [newQustion];
      }
    },

    //edit Question
    editQuestionList(state, action: PayloadAction<ExamQuestion>) {
      const question = action.payload;
      if (state.examQuestion !== null) {
        const findExamIndex = state.examQuestion.findIndex(
          (item) => item._id === question._id,
        );
        const findExamRecord = state.examQuestion.find(
          (item) => item._id === question._id,
        );
        if (findExamIndex !== -1 && findExamRecord) {
          state.examQuestion[findExamIndex] = question;
          LoadingToast();
        }
      }
    },

    //delete Question
    deleteQuestionList(state, action: PayloadAction<number[]>) {
      if (state.examQuestion !== null) {
        state.examQuestion = state.examQuestion.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getQuestionList,
  addQuestionList,
  editQuestionList,
  deleteQuestionList,
} = questionSlice.actions;

export default questionSlice.reducer;
