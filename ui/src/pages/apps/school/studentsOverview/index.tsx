import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import PendingQuiz from "@src/views/apps/school/studentsOverview/pendingQuiz";
import StudentAchievements from "@src/views/apps/school/studentsOverview/studentAchievements";
import StudentInformation from "@src/views/apps/school/studentsOverview/studentInformation";
import TestMarks from "@src/views/apps/school/studentsOverview/testMarks";
import UpcomingLecture from "@src/views/apps/school/studentsOverview/upcomingLecture";
import React, { useEffect } from "react";

const StudentsOverview: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Students" />
      <div className="grid grid-cols-12 gap-x-space">
        <StudentInformation />
        <StudentAchievements />
        <TestMarks />
        <PendingQuiz />
        <UpcomingLecture />
      </div>
    </React.Fragment>
  );
};

export default StudentsOverview;
