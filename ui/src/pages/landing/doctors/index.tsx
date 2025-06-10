import { NextPageWithLayout } from "@dtos/layout";
import AvailableFacilities from "@views/landing/landingDoctors/availableFacilities";
import Footer from "@views/landing/landingDoctors/footer";
import GetYourAppointment from "@views/landing/landingDoctors/getYourAppointment";
import Header from "@views/landing/landingDoctors/header";
import HealthService from "@views/landing/landingDoctors/healthService";
import HeroBanner from "@views/landing/landingDoctors/heroBanner";
import OurClients from "@views/landing/landingDoctors/ourClients";
import OurDoctorsTeam from "@views/landing/landingDoctors/ourDoctorsTeam";
import OurExpertDoctors from "@views/landing/landingDoctors/ourExpertDoctors";
import React, { useEffect } from "react";

const Doctors: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Doctors | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <Header />
      <HeroBanner />
      <AvailableFacilities />
      <OurDoctorsTeam />
      <HealthService />
      <OurExpertDoctors />
      <OurClients />
      <GetYourAppointment />
      <Footer />
    </React.Fragment>
  );
};

export default Doctors;
