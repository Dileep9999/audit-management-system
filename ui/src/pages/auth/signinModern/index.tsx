import { NextPageWithLayout } from "@dtos/layout";
import SignInModern from "@views/auth/signIn/signinModern";
import React, { useEffect } from "react";

const SignInModernPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "sign in | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SignInModern />
    </React.Fragment>
  );
};

export default SignInModernPage;
