import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import Explore from "@views/dashboards/schoolDashboard/explore";
import TopScoreTable from "@views/dashboards/schoolDashboard/topScore";
import TotalStudents from "@views/dashboards/schoolDashboard/totalStudents";
import UpcomingTest from "@views/dashboards/schoolDashboard/upcomingTest";
import Videos from "@views/dashboards/schoolDashboard/videos";
import Widgets from "@views/dashboards/schoolDashboard/widgets";
import React, { useEffect } from "react";

const School: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Projects | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="School" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <TotalStudents />
        <UpcomingTest />
        <TopScoreTable />
        <Videos />
        <Explore />
      </div>
    </React.Fragment>
  );
};
export default School;
