import { NextPageWithLayout } from "@dtos/layout";
import AccountDeactivationCreative from "@views/auth/accountDeactivation/accountDeactivationCreative";
import React, { useEffect } from "react";

const AccountDeactivationCreativePage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Account Deactivation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <AccountDeactivationCreative />
    </React.Fragment>
  );
};

export default AccountDeactivationCreativePage;
