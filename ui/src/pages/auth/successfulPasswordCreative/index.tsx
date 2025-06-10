import { NextPageWithLayout } from "@dtos/layout";
import SuccessfulPasswordCreative from "@views/auth/successfulPassword/successfulPasswordCreative";
import React, { useEffect } from "react";

const SuccessfulPasswordCreativePage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Successful Password | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SuccessfulPasswordCreative />
    </React.Fragment>
  );
};

export default SuccessfulPasswordCreativePage;
