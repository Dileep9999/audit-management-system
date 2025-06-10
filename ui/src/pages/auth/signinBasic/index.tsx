import { NextPageWithLayout } from "@dtos/layout";
import SignInBasic from "@views/auth/signIn/signinBasic";
import React, { useEffect } from "react";

const SignInBasicPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Sign In | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SignInBasic />
    </React.Fragment>
  );
};

export default SignInBasicPage;
