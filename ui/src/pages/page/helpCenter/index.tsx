import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import HelpCenterPage from "@views/helpCenter/Index";
import React, { useEffect } from "react";

const HelpCenter: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Help Center | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Help Center" subTitle="Pages" />
      <HelpCenterPage />
    </React.Fragment>
  );
};
export default HelpCenter;
