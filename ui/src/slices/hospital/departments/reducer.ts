import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { departments } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface departmentsState {
  department: departments[];
  isLoading: boolean;
}

const initialState: departmentsState = {
  department: initStore("d-hospital-department"),
  isLoading: false,
};

const DepartmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    //get Departments
    getDepartment(state, action: PayloadAction<departments[]>) {
      state.department = action.payload;
    },

    //add Departments
    addDepartment(state, action: PayloadAction<departments>) {
      if (state.department !== null) {
        state.department.unshift(action.payload);
      } else {
        state.department = [action.payload];
      }
    },

    //edit Departments
    editDepartment(state, action: PayloadAction<departments>) {
      const department = action.payload;
      if (state.department !== null) {
        const findDepartmentIndex = state.department.findIndex(
          (item) => item._id === department._id,
        );
        const findDepartmentRecord = state.department.find(
          (item) => item._id === department._id,
        );
        if (findDepartmentIndex !== -1 && findDepartmentRecord) {
          state.department[findDepartmentIndex] = department;
        }
        LoadingToast();
      }
    },

    //delete Departments
    deleteDepartment(state, action: PayloadAction<number[]>) {
      if (state.department !== null) {
        state.department = state.department.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getDepartment,
  addDepartment,
  editDepartment,
  deleteDepartment,
} = DepartmentsSlice.actions;
export default DepartmentsSlice.reducer;
