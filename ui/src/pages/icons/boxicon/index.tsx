import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import Boxlcons from "@src/views/icons/iconsBoxicon/boxIcons";
import ColorIcons from "@src/views/icons/iconsBoxicon/colorIcons";
import SVGCode from "@src/views/icons/iconsBoxicon/svgCode";
import SizesIcons from "@src/views/icons/iconsBoxicon/sizesIcons";

const Boxicon: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Boxicon | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Boxicon" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <Boxlcons />
        <ColorIcons />
        <SVGCode />
        <SizesIcons />
      </div>
    </React.Fragment>
  );
};

export default Boxicon;
