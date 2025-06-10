import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";

const Starter: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Starter | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Starter" subTitle="UI" />
    </React.Fragment>
  );
};
export default Starter;
