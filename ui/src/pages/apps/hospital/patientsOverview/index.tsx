import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { NextPageWithLayout } from "@src/dtos";
import { RootState } from "@src/slices/reducer";
import AppointmentsHistory from "@src/views/apps/hospital/patientsOverview/appointmentsHistory";
import InsuranceOverview from "@src/views/apps/hospital/patientsOverview/insuranceOverview";
import MedicineHistory from "@src/views/apps/hospital/patientsOverview/medicineHistory";
import Overview from "@src/views/apps/hospital/patientsOverview/overview";
import ReportsHistory from "@src/views/apps/hospital/patientsOverview/reportsHistory";
import TimeLine from "@src/views/apps/hospital/patientsOverview/timeLine";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
const PatientsOverview: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title = "Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Patients" />
      <div className="grid grid-cols-12 gap-x-space">
        <Overview />
        <TimeLine />
        <InsuranceOverview />
        <ReportsHistory />
        <MedicineHistory />
        <AppointmentsHistory />
        <Toaster
          position="top-right"
          reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
        />
      </div>
    </React.Fragment>
  );
};

export default PatientsOverview;
