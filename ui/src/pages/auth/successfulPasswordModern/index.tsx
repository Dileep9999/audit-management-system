import { NextPageWithLayout } from "@dtos/layout";
import SuccessfulPasswordModern from "@views/auth/successfulPassword/successfulPasswordModern";
import React, { useEffect } from "react";

const SuccessfulPasswordModernPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Successful Password | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SuccessfulPasswordModern />
    </React.Fragment>
  );
};

export default SuccessfulPasswordModernPage;
