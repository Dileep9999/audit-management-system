import React, { useEffect } from "react";
import { NextPageWithLayout } from "@dtos/layout";
import Header from "@views/landing/landingEcommerce/header";
import Home from "@views/landing/landingEcommerce/home";
import Products from "@views/landing/landingEcommerce/products";
import Advertisement from "@views/landing/landingEcommerce/advertisement";
import NewSeasonProducts from "@views/landing/landingEcommerce/newSeasonProducts";
import SummerFashion from "@views/landing/landingEcommerce/summerFashion";
import CoastalEdition from "@views/landing/landingEcommerce/coastalEdition";
import ClientBenefits from "@views/landing/landingEcommerce/clientBenefits";
import OurCollection from "@views/landing/landingEcommerce/ourCollection";
import InstagramPost from "@views/landing/landingEcommerce/instagramPost";
import Footer from "@views/landing/landingEcommerce/footer";
import LandingThemeMode from "@src/components/common/landingThemeMode";

const Ecommerce: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Ecommerce | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <Header />
      <Home />
      <Products />
      <Advertisement />
      <NewSeasonProducts />
      <SummerFashion />
      <CoastalEdition />
      <ClientBenefits />
      <OurCollection />
      <InstagramPost />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  );
};

export default Ecommerce;
