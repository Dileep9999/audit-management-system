import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import FontFamily from "@views/uiElements/uiTypography/fontFamily";
import FontWeight from "@views/uiElements/uiTypography/fontWeight";
import HeadingTitle from "@views/uiElements/uiTypography/headingTitle";
import React, { useEffect } from "react";

const Typographys: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Typography | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Typography" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Font Family</h6>
          </div>
          <div className="card-body">
            <FontFamily />
          </div>
        </div>
        <HeadingTitle />
        <FontWeight />
      </div>
    </React.Fragment>
  );
};

export default Typographys;
