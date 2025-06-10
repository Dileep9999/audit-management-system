import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import ColorIcons from "@src/views/icons/iconLucide/colorIcons";
import LucideIcons from "@src/views/icons/iconLucide/lucideIcons";
import SizesIcons from "@src/views/icons/iconLucide/sizesIcons";
import StrokeWidth from "@src/views/icons/iconLucide/strokeWidth";
import DuoTuneIcons from "@src/views/icons/iconLucide/duotuneIcons";

const Lucide: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Lucide | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Lucide" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <LucideIcons />
        <ColorIcons />
        <StrokeWidth />
        <SizesIcons />
        <DuoTuneIcons />
      </div>
    </React.Fragment>
  );
};

export default Lucide;
