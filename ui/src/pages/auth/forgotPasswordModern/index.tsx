import { NextPageWithLayout } from "@dtos/layout";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { RootState } from "@src/slices/reducer";
import ForgotPasswordModern from "@views/auth/forgotPassword/forgotPasswordModern";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const ForgotPasswordModernPage: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title =
      "Forgot Password | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <ForgotPasswordModern />

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default ForgotPasswordModernPage;
