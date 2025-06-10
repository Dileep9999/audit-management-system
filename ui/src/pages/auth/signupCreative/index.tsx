import { NextPageWithLayout } from "@dtos/layout";
import SignupCreative from "@views/auth/signup/signupCreative";
import React, { useEffect } from "react";

const SignUpCreativePage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "sign up | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <SignupCreative />
    </React.Fragment>
  );
};

export default SignUpCreativePage;
