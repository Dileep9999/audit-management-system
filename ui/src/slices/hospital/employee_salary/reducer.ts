import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { employeeSalary } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface employeeSalaryState {
  salary: employeeSalary[];
  isLoading: boolean;
}

const initialState: employeeSalaryState = {
  salary: initStore("d-hospital-employee-salary"),
  isLoading: false,
};

const EmployeeSalarySlice = createSlice({
  name: "event_grid",
  initialState,
  reducers: {
    // get empoyee salary data
    getEmaployeeSalary(state, action: PayloadAction<employeeSalary[]>) {
      state.salary = action.payload;
    },

    // add new empoyee salary
    addEmaployeeSalary(state, action: PayloadAction<employeeSalary>) {
      if (state.salary !== null) {
        state.salary.unshift(action.payload);
      } else {
        state.salary = [action.payload];
      }
    },

    //edite salary record
    editEmaployeeSalary(state, action: PayloadAction<employeeSalary>) {
      const salary = action.payload;
      if (state.salary !== null) {
        const findSalaryIndex = state.salary.findIndex(
          (item) => item._id === salary._id,
        );
        const findSalaryRecord = state.salary.find(
          (item) => item._id === salary._id,
        );
        if (findSalaryIndex !== -1 && findSalaryRecord) {
          state.salary[findSalaryIndex] = salary;
        }
        LoadingToast();
      }
    },

    //delete salary record
    deleteEmaployeeSalary(state, action: PayloadAction<number[]>) {
      if (state.salary !== null) {
        state.salary = state.salary.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getEmaployeeSalary,
  addEmaployeeSalary,
  editEmaployeeSalary,
  deleteEmaployeeSalary,
} = EmployeeSalarySlice.actions;
export default EmployeeSalarySlice.reducer;
