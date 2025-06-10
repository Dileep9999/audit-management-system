import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import RecentInvoice from "@src/views/widgets/data/recentInvoice";
import React, { useEffect } from "react";
import TopProducts from "@src/views/widgets/data/topProducts";

const WidgetsData: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Domiex | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Data" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <TopProducts />
        <RecentInvoice />
      </div>
    </React.Fragment>
  );
};

export default WidgetsData;
