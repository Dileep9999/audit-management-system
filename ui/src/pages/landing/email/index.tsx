import LandingThemeMode from "@src/components/common/landingThemeMode";
import { NextPageWithLayout } from "@dtos/layout";
import EmailAtomation from "@views/landing/landingEmail/emailAtomation";
import EmailFeatures from "@views/landing/landingEmail/emailFeatures";
import EmailMarketing from "@views/landing/landingEmail/emailMarketing";
import FAQSection from "@views/landing/landingEmail/faqSection";
import Footer from "@views/landing/landingEmail/footer";
import Header from "@views/landing/landingEmail/header";
import NewUpdates from "@views/landing/landingEmail/newUpdates";
import OurBestPlans from "@views/landing/landingEmail/ourBestPlans";
import ServicesSection from "@views/landing/landingEmail/ourServices";
import React, { useEffect } from "react";

const EmailLanding: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Email | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <Header />
      <EmailMarketing />
      <ServicesSection />
      <OurBestPlans />
      <EmailFeatures />
      <EmailAtomation />
      <FAQSection />
      <NewUpdates />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  );
};

export default EmailLanding;
