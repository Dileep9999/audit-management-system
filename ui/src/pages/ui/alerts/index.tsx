import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicAlert from "@views/uiElements/uiAlerts/basicAlert";
import BasicAlerts from "@views/uiElements/uiAlerts/basicAlerts";
import GradientAlerts from "@views/uiElements/uiAlerts/gradientAlerts";
import IconsAlerts from "@views/uiElements/uiAlerts/iconsAlerts";
import LiveAlerts from "@views/uiElements/uiAlerts/liveAlerts";
import OutlineAlert from "@views/uiElements/uiAlerts/outlineAlerts";
import SoftAlert from "@views/uiElements/uiAlerts/softAlert";
import SolidAlerts from "@views/uiElements/uiAlerts/solidAlerts";
import React, { useEffect } from "react";
import IconWithAlerts from "@src/views/uiElements/uiAlerts/iconswithAlerts";

const Alerts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Alerts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title={"Alerts"} subTitle={"UI"} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-space">
        <BasicAlert />
        <SoftAlert />
        <OutlineAlert />
        <SolidAlerts />
      </div>
      <IconWithAlerts />
      <GradientAlerts />
      <LiveAlerts />
      <IconsAlerts />
      <BasicAlerts />
    </React.Fragment>
  );
};

export default Alerts;
