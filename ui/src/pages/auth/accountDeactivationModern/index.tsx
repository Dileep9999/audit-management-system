import { NextPageWithLayout } from "@dtos/layout";
import AccountDeactivationModern from "@views/auth/accountDeactivation/accountDeactivationModern";
import React, { useEffect } from "react";

const AccountDeactivationModernPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Account Deactivation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <AccountDeactivationModern />
    </React.Fragment>
  );
};

export default AccountDeactivationModernPage;
