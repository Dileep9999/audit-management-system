import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import AnimationTooltip from "@views/uiElements/uIToolTips/animationTooltip";
import ArrowlessTooltip from "@views/uiElements/uIToolTips/arrowlessTooltip";
import CustomeTooltip from "@views/uiElements/uIToolTips/customeTooltip";
import DefaultToolTips from "@views/uiElements/uIToolTips/defaultTooltips";
import FollowCursor from "@views/uiElements/uIToolTips/followCursor";
import NoFlipTooltip from "@views/uiElements/uIToolTips/noFlipTooltip";
import PlacementTooltip from "@views/uiElements/uIToolTips/placementTooltip";
import React, { useEffect } from "react";

const Tooltips: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Ui Tooltips | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="UI Tooltip" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <DefaultToolTips />
        <FollowCursor />
        <ArrowlessTooltip />
        <NoFlipTooltip />
        <CustomeTooltip />
        <AnimationTooltip />
        <PlacementTooltip />
      </div>
    </React.Fragment>
  );
};

export default Tooltips;
