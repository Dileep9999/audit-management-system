import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import AnalyticsChart from "@views/dashboards/fileManagerDashboard/analyticsChart";
import Favorites from "@views/dashboards/fileManagerDashboard/favorites";
import QuickAccess from "@views/dashboards/fileManagerDashboard/quickAccess";
import RecentFiles from "@views/dashboards/fileManagerDashboard/recentFiles";
import Storage from "@views/dashboards/fileManagerDashboard/storage";
import Widgets from "@views/dashboards/fileManagerDashboard/widgets";
import React, { useEffect } from "react";

const FileManager: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "File Manager | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="File Manager" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <AnalyticsChart />
        <RecentFiles />
        <Storage />
        <QuickAccess />
        <Favorites />
      </div>
    </React.Fragment>
  );
};

export default FileManager;
