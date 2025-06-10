import { NextPageWithLayout } from "@dtos/layout";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { RootState } from "@src/slices/reducer";
import ForgotPasswordCreative from "@views/auth/forgotPassword/forgotPasswordCreative";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const ForgotPasswordCreativePage: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title =
      "Forgot Password | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <ForgotPasswordCreative />

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default ForgotPasswordCreativePage;
