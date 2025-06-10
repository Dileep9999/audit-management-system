import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import AnimationNavigation from "@views/uiElements/uiButtonNavigation/animationNavigation";
import BorderNavigation from "@views/uiElements/uiButtonNavigation/borderNavigation";
import NavigationBottom from "@views/uiElements/uiButtonNavigation/navigationBottom";
import React, { useEffect } from "react";

const ButtonNavigation: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Button Navigation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Button Navigation" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Bottom Navigation</h6>
          </div>
          <div className="card-body">
            <NavigationBottom />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Animation Navigation</h6>
          </div>
          <div className="card-body">
            <AnimationNavigation />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Border Navigation</h6>
          </div>
          <div className="card-body">
            <BorderNavigation />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ButtonNavigation;
