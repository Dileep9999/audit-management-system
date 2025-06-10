import React, { useEffect } from "react";
import { NextPageWithLayout } from "@dtos/layout";
import LandingThemeMode from "@src/components/common/landingThemeMode";
import Header from "@views/landing/landingInvoice/header";
import YourInvoicing from "@views/landing/landingInvoice/yourInvoicing";
import Freelancers from "@views/landing/landingInvoice/freelancers";
import OnlineInvoicing from "@views/landing/landingInvoice/onlineInvoicing";
import ReadyToGive from "@views/landing/landingInvoice/readyToGive";
import ReadyToGetStarted from "@views/landing/landingInvoice/readyToGetStarted";
import GetInTouch from "@views/landing/landingInvoice/getInTouch";
import Footer from "@views/landing/landingInvoice/footer";

const Invoice: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Invoice | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <Header />
      <YourInvoicing />
      <Freelancers />
      <OnlineInvoicing />
      <ReadyToGive />
      <ReadyToGetStarted />
      <GetInTouch />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  );
};

export default Invoice;
