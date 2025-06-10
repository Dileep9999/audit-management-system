import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initStore } from "@src/utils/init_store";
import { TeacherPayroll } from "@src/dtos";

interface PayrollState {
  payroll: TeacherPayroll[] | null;
  isLoading: boolean;
}

const initialState: PayrollState = {
  payroll: initStore("d-teacher-payroll"),
  isLoading: false,
};

const payrollSlice = createSlice({
  name: "teacher_payroll",
  initialState,
  reducers: {
    //get teacher payroll data
    getPayrollList(state, action: PayloadAction<TeacherPayroll[]>) {
      state.payroll = action.payload;
    },
  },
});

export const { getPayrollList } = payrollSlice.actions;

export default payrollSlice.reducer;
