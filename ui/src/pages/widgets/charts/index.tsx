import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import RevenueCharts from "@views/widgets/charts/revenueCharts";
import TotalSales from "@views/widgets/charts/totalSales";
import TotalViewPerformance from "@views/widgets/charts/totalViewPerformance";
import React, { useEffect } from "react";

const WidgetsCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Charts" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <RevenueCharts />
        <TotalSales />
        <TotalViewPerformance />
      </div>
    </React.Fragment>
  );
};

export default WidgetsCharts;
