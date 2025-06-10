import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { Reports, Medicine, Appointments } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface overview {
  reportList: Reports[] | null;
  medicine: Medicine[] | null;
  appointments: Appointments[] | null;
  isLoading: boolean;
}

const initialState: overview = {
  reportList: initStore("d-hospital-reports"),
  medicine: initStore("d-hospital-madicine"),
  appointments: initStore("d-hospital-appointments"),
  isLoading: false,
};

const OverviewSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    // get reports data

    getReport(state, action: PayloadAction<Reports[]>) {
      state.reportList = action.payload;
    },

    addReport(state, action: PayloadAction<Reports>) {
      const newCustomer = action.payload;
      if (state.reportList !== null) {
        state.reportList.unshift(newCustomer);
      } else {
        state.reportList = [newCustomer];
      }
    },

    //edit reports data
    editReport(state, action: PayloadAction<Reports>) {
      const reports = action.payload;
      if (state.reportList !== null) {
        const findReportsIndex = state.reportList.findIndex(
          (item) => item._id === reports._id,
        );
        const findReportsRecord = state.reportList.find(
          (item) => item._id === reports._id,
        );
        if (findReportsIndex !== -1 && findReportsRecord) {
          state.reportList[findReportsIndex] = reports;
        }
        LoadingToast();
      }
    },

    //delete reports data
    deleteReport(state, action: PayloadAction<number[]>) {
      if (state.reportList !== null) {
        state.reportList = state.reportList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // Medicine

    //get madicine data
    getMedicine(state, action: PayloadAction<Medicine[]>) {
      state.medicine = action.payload;
    },

    //add medicine data
    addMedicine(state, action: PayloadAction<Medicine>) {
      const newMadicine = action.payload;
      if (state.medicine !== null) {
        state.medicine.unshift(newMadicine);
      }
    },

    //edite madicine data
    editMedicine(state, action: PayloadAction<Medicine>) {
      const madicine = action.payload;
      if (state.medicine !== null) {
        const findMadicineIndex = state.medicine.findIndex(
          (item) => item._id === madicine._id,
        );
        const findMadicineRecord = state.medicine.find(
          (item) => item._id === madicine._id,
        );
        if (findMadicineIndex !== -1 && findMadicineRecord) {
          state.medicine[findMadicineIndex] = madicine;
        }
      }
    },

    //delete madicine data
    deleteMedicine(state, action: PayloadAction<number[]>) {
      if (state.medicine !== null) {
        state.medicine = state.medicine.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    //appointments

    getAppointments(state, action: PayloadAction<Appointments[]>) {
      state.appointments = action.payload;
    },

    addAppointments(state, action: PayloadAction<Appointments>) {
      const newAppointments = action.payload;
      if (state.appointments !== null) {
        state.appointments.unshift(newAppointments);
      }
    },

    editAppointments(state, action: PayloadAction<Appointments>) {
      const appointment = action.payload;
      if (state.appointments !== null) {
        const findAppointmentsIndex = state.appointments.findIndex(
          (item) => item._id === appointment._id,
        );
        const findAppointmentsRecord = state.appointments.find(
          (item) => item._id === appointment._id,
        );
        if (findAppointmentsIndex !== -1 && findAppointmentsRecord) {
          state.appointments[findAppointmentsIndex] = appointment;
        }
      }
    },
    deleteAppointments(state, action: PayloadAction<number[]>) {
      if (state.appointments !== null) {
        state.appointments = state.appointments.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const {
  getReport,
  addReport,
  editReport,
  deleteReport,
  getMedicine,
  addMedicine,
  editMedicine,
  deleteMedicine,
  getAppointments,
  addAppointments,
  editAppointments,
  deleteAppointments,
} = OverviewSlice.actions;

export default OverviewSlice.reducer;
