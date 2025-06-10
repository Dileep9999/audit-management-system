import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicSlider from "@views/uiAdvanced/uiAdvancedSwiper/basicSlider";
import GrabCursorSlider from "@views/uiAdvanced/uiAdvancedSwiper/grabcursor";
import PaginationSwiper from "@views/uiAdvanced/uiAdvancedSwiper/pagination";
import PaginationDynamicSlider from "@views/uiAdvanced/uiAdvancedSwiper/paginationDynamic";
import Slidesperview from "@views/uiAdvanced/uiAdvancedSwiper/slidesPerView";
import VerticalSlider from "@views/uiAdvanced/uiAdvancedSwiper/verticalSwiper";
import React, { useEffect } from "react";

const SwiperElement: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Swiper | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Swiper" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicSlider />
        <PaginationDynamicSlider />
        <PaginationSwiper />
        <VerticalSlider />
        <GrabCursorSlider />
        <Slidesperview />
      </div>
    </React.Fragment>
  );
};

export default SwiperElement;
