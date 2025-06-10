import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import AppointmentRequest from "@views/dashboards/hospitalDashboard/appointmentRequest";
import BirthAndDeathAnalytics from "@views/dashboards/hospitalDashboard/birthAndDeathAnalytics";
import PatientData from "@views/dashboards/hospitalDashboard/patientData";
import PatientsData from "@views/dashboards/hospitalDashboard/patientsData";
import PatientsHistory from "@views/dashboards/hospitalDashboard/patientsHistory";
import PatientVisitDepartment from "@views/dashboards/hospitalDashboard/patientVisitDepartment";
import RoomsAnalytics from "@views/dashboards/hospitalDashboard/roomsAnalytics";
import SummaryTreatment from "@views/dashboards/hospitalDashboard/summaryTreatment";
import UpcomingConsultation from "@views/dashboards/hospitalDashboard/upcomingConsultation";
import React, { useEffect } from "react";

const Hospital: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Hospital | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title={"Hospital"} subTitle={"Dashboards"} />
      <div className="grid grid-cols-12 gap-x-space">
        <PatientData />
        <PatientVisitDepartment />
        <AppointmentRequest />
        <PatientsHistory />
        <UpcomingConsultation />
        <BirthAndDeathAnalytics />
        <RoomsAnalytics />
        <SummaryTreatment />
        <PatientsData />
      </div>
    </React.Fragment>
  );
};
export default Hospital;
