import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { NextPageWithLayout } from "@src/dtos";
import { RootState } from "@src/slices/reducer";
import AppointmentsInformation from "@src/views/apps/hospital/appointmentsLists/appointmentsInformation";
import AppointmentsList from "@src/views/apps/hospital/appointmentsLists/appointmentsList";
import TodayAppointments from "@src/views/apps/hospital/appointmentsLists/todayAppointments";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const AppointmentsLists: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title = "List View | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Appointments" />
      <AppointmentsInformation />
      <TodayAppointments />
      <AppointmentsList />

      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default AppointmentsLists;
