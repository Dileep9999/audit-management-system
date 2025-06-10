import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { NextPageWithLayout } from "@src/dtos";
import { RootState } from "@src/slices/reducer";
import ExamInformation from "@src/views/apps/school/examSchedule/examInformation";
import ExamScheduleList from "@src/views/apps/school/examSchedule/examScheduleList";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const ExamSchedule: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title = "Schedule | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Schedule" subTitle="Exam" />
      <ExamInformation />
      <ExamScheduleList />

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default ExamSchedule;
