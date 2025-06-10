import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import AwesomeIcons from "@src/views/icons/iconsLineAwesome/awesomeIcons";
import ColorIcons from "@src/views/icons/iconsLineAwesome/colorIcons";
import SizesIcons from "@src/views/icons/iconsLineAwesome/sizesIcons";

const LineAwesome: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Line Awesome | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Line Awesome" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <AwesomeIcons />
        <ColorIcons />
        <SizesIcons />
      </div>
    </React.Fragment>
  );
};
export default LineAwesome;
