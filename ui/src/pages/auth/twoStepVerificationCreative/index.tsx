import React, { useEffect } from "react";
import { NextPageWithLayout } from "@dtos/layout";
import TwoStepVerificationCreative from "@views/auth/twoStepVerification/twoStepVerificationCreative";
import { Toaster } from "react-hot-toast";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { RootState } from "@src/slices/reducer";
import { useSelector } from "react-redux";

const TwoStepVerificationCreativePage: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title =
      "Two Step Verification | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <TwoStepVerificationCreative formId="otp-form1" />

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default TwoStepVerificationCreativePage;
