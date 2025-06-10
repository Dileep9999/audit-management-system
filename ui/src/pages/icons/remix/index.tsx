import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import RemixIcons from "@src/views/icons/iconsRemix/remixIcons";
import ColorIcons from "@src/views/icons/iconsRemix/colorIconss";
import SVGCode from "@src/views/icons/iconsRemix/svgCode";
import SizesIcons from "@src/views/icons/iconsRemix/sizesIcons";

const Remix: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Remix | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Remix" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <RemixIcons />
        <ColorIcons />
        <SVGCode />
        <SizesIcons />
      </div>
    </React.Fragment>
  );
};

export default Remix;
