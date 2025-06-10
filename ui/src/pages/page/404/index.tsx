import FourZeroFour from "@src/components/common/fourZeroFour";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";

const PageNotFoundError: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "404 | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* page not found */}
      <FourZeroFour />
    </React.Fragment>
  );
};
export default PageNotFoundError;
