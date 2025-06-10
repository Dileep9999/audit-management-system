import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import Achievements from "@src/views/apps/school/teachersOverview/achievements";
import Quiz from "@src/views/apps/school/teachersOverview/quiz";
import TeacherInformation from "@src/views/apps/school/teachersOverview/teacherInformation";
import Test from "@src/views/apps/school/teachersOverview/test";
import TimeSpendingLecture from "@src/views/apps/school/teachersOverview/timeSpendingLecture";
import UpcomingLecture from "@src/views/apps/school/teachersOverview/upcomingLecture";
import React, { useEffect } from "react";

const TeachersOverview: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Teachers" />
      <div className="grid grid-cols-12 gap-x-space">
        <TeacherInformation />
        <Achievements />
        <Test />
        <TimeSpendingLecture />
        <Quiz />
        <UpcomingLecture />
      </div>
    </React.Fragment>
  );
};

export default TeachersOverview;
