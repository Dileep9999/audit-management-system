import { NextPageWithLayout } from "@dtos/layout";
import AccountDeactivationBasic from "@views/auth/accountDeactivation/accountDeactivationBasic";
import React, { useEffect } from "react";

const AccountDeactivationBasicPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Account Deactivation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <AccountDeactivationBasic />
    </React.Fragment>
  );
};

export default AccountDeactivationBasicPage;
