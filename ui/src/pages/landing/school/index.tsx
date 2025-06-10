import LandingThemeMode from "@src/components/common/landingThemeMode";
import { NextPageWithLayout } from "@dtos/layout";
import AboutUs from "@views/landing/landingSchool/aboutUs";
import CTA from "@views/landing/landingSchool/cta";
import Footer from "@views/landing/landingSchool/footer";
import Header from "@views/landing/landingSchool/header";
import HeroBanner from "@views/landing/landingSchool/heroBanner";
import HowToStart from "@views/landing/landingSchool/howToStart";
import InformationAlert from "@views/landing/landingSchool/informationAlert";
import LatestBlogs from "@views/landing/landingSchool/latestBlogs";
import OurMentors from "@views/landing/landingSchool/ourMentors";
import StudentsReview from "@views/landing/landingSchool/studentsReview";
import TopEducation from "@views/landing/landingSchool/topEducation";
import React, { useEffect } from "react";

const SchoolLanding: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "School | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <InformationAlert />
      <Header />
      <HeroBanner />
      <TopEducation />
      <AboutUs />
      <HowToStart />
      <StudentsReview />
      <OurMentors />
      <LatestBlogs />
      <CTA />
      <Footer />
      <LandingThemeMode bgColor="bg-orange-500" />
    </React.Fragment>
  );
};

export default SchoolLanding;
