import { NextPageWithLayout } from "@dtos/layout";
import SignupBasic from "@views/auth/signup/signupBasic";
import React, { useEffect } from "react";

const SignUpBasicPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "sign up | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SignupBasic />
    </React.Fragment>
  );
};

export default SignUpBasicPage;
