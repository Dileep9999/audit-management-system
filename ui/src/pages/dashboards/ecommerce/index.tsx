import React, { useEffect } from "react";
import { NextPageWithLayout } from "@dtos/layout";
import BreadCrumb from "@src/components/common/breadCrumb";
import Welcome from "@views/dashboards/ecommerceDashboard/welcome";
import EcomInfo from "@views/dashboards/ecommerceDashboard/ecomInfo";
import ProductStock from "@views/dashboards/ecommerceDashboard/productStock";
import MarkersMap from "@views/dashboards/ecommerceDashboard/location";
import TopSellingProducts from "@views/dashboards/ecommerceDashboard/topSellingProducts";
import TopCountries from "@views/dashboards/ecommerceDashboard/topCountries";
import Traffic from "@views/dashboards/ecommerceDashboard/traffic";
import Message from "@views/dashboards/ecommerceDashboard/message";

import { useNavigate } from "react-router-dom";

const DashboardsPage: NextPageWithLayout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Ecommerce | Domiex - React TS Admin & Dashboard Template";
    navigate("/dashboards/ecommerce");
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
