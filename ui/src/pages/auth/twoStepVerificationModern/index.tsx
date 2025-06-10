import { NextPageWithLayout } from "@dtos/layout";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { RootState } from "@src/slices/reducer";
import TwoStepVerificationModern from "@views/auth/twoStepVerification/twoStepVerificationModern";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const TwoStepVerificationModernPage: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title =
      "Two Step Verification | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <TwoStepVerificationModern formId="otp-form1" />

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default TwoStepVerificationModernPage;
