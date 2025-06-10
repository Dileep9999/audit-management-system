import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicLinks from "@views/uiElements/uiLinks/basicLinks";
import ColoredLinks from "@views/uiElements/uiLinks/coloredLinks";
import HoverLinks from "@views/uiElements/uiLinks/hoverLinks";
import IconLiks from "@views/uiElements/uiLinks/iconLinks";
import UnderlineColored from "@views/uiElements/uiLinks/underlineColored";
import UnderlineHover from "@views/uiElements/uiLinks/underlineHover";
import UnderlineHoverColored from "@views/uiElements/uiLinks/underlineHoverColored";
import UnderlineLinks from "@views/uiElements/uiLinks/underlineLinks";
import React, { useEffect } from "react";

const Links: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Links | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="UI Links" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicLinks />
        <UnderlineLinks />
        <UnderlineHover />
        <HoverLinks />
        <ColoredLinks />
        <UnderlineColored />
        <UnderlineHoverColored />
        <IconLiks />
      </div>
    </React.Fragment>
  );
};

export default Links;
