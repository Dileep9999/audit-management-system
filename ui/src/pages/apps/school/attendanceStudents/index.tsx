import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import AttendanceList from "@src/views/apps/school/studentsAttendances/attendanceList";
import StudentsAttendancesInfo from "@src/views/apps/school/studentsAttendances/studentsAttendancesInfo";
import React, { useEffect } from "react";

const StudentsAttendances: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Students | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Students" subTitle="Attendances" />
      <StudentsAttendancesInfo />
      <AttendanceList />
    </React.Fragment>
  );
};

export default StudentsAttendances;
