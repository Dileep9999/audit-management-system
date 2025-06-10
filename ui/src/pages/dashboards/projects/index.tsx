import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import ActiveProjects from "@views/dashboards/projectsDashboard/activeProjects";
import Activity from "@views/dashboards/projectsDashboard/activity";
import AssignProject from "@views/dashboards/projectsDashboard/assignProject";
import ClientList from "@views/dashboards/projectsDashboard/clientList";
import DailyWorkingReports from "@views/dashboards/projectsDashboard/dailyWorkingReports";
import MyTasks from "@views/dashboards/projectsDashboard/myTasks";
import ProjectStatus from "@views/dashboards/projectsDashboard/projectStatus";
import TaskActivity from "@views/dashboards/projectsDashboard/taskActivity";
import TaskLists from "@views/dashboards/projectsDashboard/taskLists";
import TeamMembers from "@views/dashboards/projectsDashboard/teamMembers";
import Widgets from "@views/dashboards/projectsDashboard/widgets";
import React, { useEffect } from "react";

const Projects: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Projects | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Projects" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <ProjectStatus />
        <Widgets />
        <DailyWorkingReports />
        <ClientList />
        <AssignProject />
        <ActiveProjects />
        <TeamMembers />
        <TaskActivity />
        <MyTasks />
        <TaskLists />
        <Activity />
      </div>
    </React.Fragment>
  );
};
export default Projects;
