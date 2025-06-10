import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { StaffList } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface StaffListState {
  staffList: StaffList[] | null;
  isLoading: boolean;
}

const initialState: StaffListState = {
  staffList: initStore("d-hospital-staff-list"),
  isLoading: false,
};

const StaffListSlice = createSlice({
  name: "staffList",
  initialState,
  reducers: {
    getStaffList(state, action: PayloadAction<StaffList[]>) {
      state.staffList = action.payload;
    },

    addStaffList(state, action: PayloadAction<StaffList>) {
      const newStaff = action.payload;
      if (state.staffList !== null) {
        state.staffList.unshift(newStaff);
      } else {
        state.staffList = [newStaff];
      }
    },
    editStaffList(state, action: PayloadAction<StaffList>) {
      const staff = action.payload;
      if (state.staffList !== null) {
        const findStaffIndex = state.staffList.findIndex(
          (item) => item._id === staff._id,
        );
        const findStaffRecord = state.staffList.find(
          (item) => item._id === staff._id,
        );
        if (findStaffIndex !== -1 && findStaffRecord) {
          state.staffList[findStaffIndex] = staff;
        }
        LoadingToast();
      }
    },

    deleteStaffList(state, action: PayloadAction<number[]>) {
      if (state.staffList !== null) {
        state.staffList = state.staffList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const { getStaffList, addStaffList, editStaffList, deleteStaffList } =
  StaffListSlice.actions;

export default StaffListSlice.reducer;
