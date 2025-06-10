import { NextPageWithLayout } from "@dtos/layout";
import SuccessfulPasswordBasic from "@views/auth/successfulPassword/successfulPasswordBasic";
import React, { useEffect } from "react";

const SuccessfulPasswordBasicPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Successful Password | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SuccessfulPasswordBasic />
    </React.Fragment>
  );
};

export default SuccessfulPasswordBasicPage;
