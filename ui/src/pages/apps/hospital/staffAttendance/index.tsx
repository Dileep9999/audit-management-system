import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import AttendanceList from "@src/views/apps/hospital/staffAttendance/attendanceList";
import Information from "@src/views/apps/hospital/staffAttendance/information";
import React, { useEffect } from "react";

const StaffAttendance: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Attendance | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Attendance" subTitle="Staff" />
      <div className="grid grid-cols-12 gap-x-space">
        <Information />
        <AttendanceList />
      </div>
    </React.Fragment>
  );
};

export default StaffAttendance;
