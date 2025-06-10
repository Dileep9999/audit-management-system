import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BounceLoader from "@views/uiElements/uiLoader/bounceLoader";
import GradientLoader from "@views/uiElements/uiLoader/gradientLoader";
import LoaderModern from "@views/uiElements/uiLoader/loaderModern";
import PingLoader from "@views/uiElements/uiLoader/pingLoader";
import PulseLoader from "@views/uiElements/uiLoader/pulseLoader";
import SpinLoader from "@views/uiElements/uiLoader/spinLoader";
import React, { useEffect } from "react";
import OvelShapedSpinner from "@views/uiElements/uiLoader/ovelShapedSpinner";
import Loadingdots from "@views/uiElements/uiLoader/loadingdots";
import Button from "@views/uiElements/uiLoader/button";

const Loader: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Loader | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Loader" subTitle="UI" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Spin Loader</h6>
          </div>
          <div className="card-body">
            <SpinLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Modern Spin Loader</h6>
          </div>
          <div className="card-body">
            <LoaderModern />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Bounce Loader</h6>
          </div>
          <div className="card-body">
            <BounceLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Ping Loader</h6>
          </div>
          <div className="card-body">
            <PingLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Pulse Loader</h6>
          </div>
          <div className="card-body">
            <PulseLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Gradient Loader</h6>
          </div>
          <div className="card-body">
            <GradientLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Button</h6>
          </div>
          <div className="card-body">
            <Button />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Ovel Shaped Spinner</h6>
          </div>
          <OvelShapedSpinner />
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Loading dots</h6>
          </div>
          <Loadingdots />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Loader;
