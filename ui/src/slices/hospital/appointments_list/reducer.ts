import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { TodayAppointments } from "@src/dtos";
import { AppointmentList } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface appointmentsLists {
  todaysAppointments: TodayAppointments[] | null;
  appointments: AppointmentList[] | null;
  isLoading: boolean;
}

const initialState: appointmentsLists = {
  todaysAppointments: initStore("d-hospital-appointments-todaylist"),
  appointments: initStore("d-hospital-appointments-list"),
  isLoading: false,
};

const AppointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    // get todays appointments
    getTodaysAppointments(state, action: PayloadAction<TodayAppointments[]>) {
      state.todaysAppointments = action.payload;
    },

    // add new todays appointments
    addTodaysAppointments(state, action: PayloadAction<TodayAppointments>) {
      const newTodayAppointments = action.payload;
      if (state.todaysAppointments !== null) {
        state.todaysAppointments.unshift(newTodayAppointments);
      } else {
        state.todaysAppointments = [newTodayAppointments];
      }
    },

    // edit todays appointments
    editTodaysAppointments(state, action: PayloadAction<TodayAppointments>) {
      const todayAppointment = action.payload;
      if (state.todaysAppointments !== null) {
        const findTodayAppointmentIndex = state.todaysAppointments.findIndex(
          (item) => item._id === todayAppointment._id,
        );
        const findTodayAppointmentRecord = state.todaysAppointments.find(
          (item) => item._id === todayAppointment._id,
        );
        if (findTodayAppointmentIndex !== -1 && findTodayAppointmentRecord) {
          state.todaysAppointments[findTodayAppointmentIndex] =
            todayAppointment;
        }
        LoadingToast();
      }
    },

    // delete todays appointments
    deleteTodaysAppointments(state, action: PayloadAction<number[]>) {
      if (state.todaysAppointments !== null) {
        state.todaysAppointments = state.todaysAppointments.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    //appointments List
    getAppointmentsList(state, action: PayloadAction<AppointmentList[]>) {
      state.appointments = action.payload;
    },

    // add new appointments list
    addAppointmentsList(state, action: PayloadAction<AppointmentList>) {
      const newAppointments = action.payload;
      if (state.appointments !== null) {
        state.appointments.unshift(newAppointments);
      }
    },

    // edit appointments list
    editAppointmentsList(state, action: PayloadAction<AppointmentList>) {
      const appointment = action.payload;
      if (state.appointments !== null) {
        const findAppointmentIndex = state.appointments.findIndex(
          (item) => item._id === appointment._id,
        );
        const findAppointmentRecord = state.appointments.find(
          (item) => item._id === appointment._id,
        );
        if (findAppointmentIndex !== -1 && findAppointmentRecord) {
          state.appointments[findAppointmentIndex] = appointment;
        }
      }
    },

    // delete appointments list
    deleteAppointmentsList(state, action: PayloadAction<number[]>) {
      if (state.appointments !== null) {
        state.appointments = state.appointments.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getTodaysAppointments,
  addTodaysAppointments,
  editTodaysAppointments,
  deleteTodaysAppointments,

  getAppointmentsList,
  addAppointmentsList,
  editAppointmentsList,
  deleteAppointmentsList,
} = AppointmentSlice.actions;

export default AppointmentSlice.reducer;
