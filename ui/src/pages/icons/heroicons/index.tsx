import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import HeroiconsIcons from "@src/views/icons/iconsHeroicons/heroiconsIcons";
import OutlineSolidIcons from "@src/views/icons/iconsHeroicons/outline&SolidIcons";
import SizesIcons from "@src/views/icons/iconsHeroicons/sizesIcons";

const HeroIcon: NextPageWithLayout = () => {
  useEffect(() => {
    ``;
    document.title = "Heroicons | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Heroicons" subTitle="Icons" />
      <HeroiconsIcons />
      <OutlineSolidIcons />
      <SizesIcons />
    </React.Fragment>
  );
};
export default HeroIcon;
