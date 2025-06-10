import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import FadeAnimation from "@views/uiAdvanced/uiAdvancedAnimation/fadeAnimation";
import FlipAnimation from "@views/uiAdvanced/uiAdvancedAnimation/flipAnimation";
import ZoomAnimation from "@views/uiAdvanced/uiAdvancedAnimation/zoomAnimation";
import AnchorPlacement from "@views/uiAdvanced/uiAdvancedAnimation/anchorPlacement";
import DifferentSettingsExamplesAnimation from "@src/views/uiAdvanced/uiAdvancedAnimation/differentsettingsexamplesAnimation";

const AdvancedAnimation: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Animation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Animation" subTitle="UI Advanced" />
      <FadeAnimation />
      <FlipAnimation />
      <ZoomAnimation />
      <DifferentSettingsExamplesAnimation />
      <AnchorPlacement />
    </React.Fragment>
  );
};

export default AdvancedAnimation;
