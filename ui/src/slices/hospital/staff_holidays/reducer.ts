import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { Holidays } from "@src/dtos/apps/holidays";
import { initStore } from "@src/utils/init_store";

interface HolidaysState {
  holidays: Holidays[];
  isLoading: boolean;
}

const initialState: HolidaysState = {
  holidays: initStore("d-hospital-holidays"),
  isLoading: false,
};

const HolidaysListSlice = createSlice({
  name: "holidays",
  initialState,
  reducers: {
    getHolidays(state, action: PayloadAction<Holidays[]>) {
      state.holidays = action.payload;
    },
    addHolidays(state, action: PayloadAction<Holidays>) {
      if (state.holidays !== null) {
        state.holidays.unshift(action.payload);
      } else {
        state.holidays = [action.payload];
      }
    },

    editHolidays(state, action: PayloadAction<Holidays>) {
      const customer = action.payload;
      if (state.holidays !== null) {
        const findHolidayIndex = state.holidays.findIndex(
          (item) => item._id === customer._id,
        );
        const findHolidayRecord = state.holidays.find(
          (item) => item._id === customer._id,
        );
        if (findHolidayIndex !== -1 && findHolidayRecord) {
          state.holidays[findHolidayIndex] = customer;
        }
        LoadingToast();
      }
    },

    deleteHolidays(state, action: PayloadAction<number[]>) {
      if (state.holidays !== null) {
        state.holidays = state.holidays.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const { getHolidays, addHolidays, editHolidays, deleteHolidays } =
  HolidaysListSlice.actions;
export default HolidaysListSlice.reducer;
