import { NextPageWithLayout } from "@dtos/layout";
import SignupModern from "@views/auth/signup/signupModern";
import React, { useEffect } from "react";

const SignUpModernPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "sign up | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SignupModern />
    </React.Fragment>
  );
};

export default SignUpModernPage;
