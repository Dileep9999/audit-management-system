import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import Effect3D from "@views/uiAdvanced/uiAdvanced3d/effect3D";
import React, { useEffect } from "react";

const AdvancedEffect: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "3D Effect | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="3D Effect" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <Effect3D />
      </div>
    </React.Fragment>
  );
};

export default AdvancedEffect;
