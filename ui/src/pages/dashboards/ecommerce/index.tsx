import React from "react";
import { NextPageWithLayout } from "@dtos/layout";
import BreadCrumb from "@src/components/common/breadCrumb";
import Welcome from "@views/dashboardDashboard/welcome";
import EcomInfo from "@views/dashboardDashboard/ecomInfo";
import ProductStock from "@views/dashboardDashboard/productStock";
import MarkersMap from "@views/dashboardDashboard/location";
import TopSellingProducts from "@views/dashboardDashboard/topSellingProducts";
import TopCountries from "@views/dashboardDashboard/topCountries";
import Traffic from "@views/dashboardDashboard/traffic";
import Message from "@views/dashboardDashboard/message";

const DashboardsPage: NextPageWithLayout = () => {
  React.useEffect(() => {
    document.title = "Ecommerce | AMS - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title={"Ecommerce"} subTitle={"Dashboards"} />
      <div className="grid grid-cols-12 gap-x-space">
        <Welcome />
      </div>
    </React.Fragment>
  );
};

export default DashboardsPage;
