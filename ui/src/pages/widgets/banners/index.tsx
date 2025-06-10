import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BookAppointment from "@views/widgets/banners/bookAppointment";
import CustomerSupport from "@views/widgets/banners/customerSupport";
import SimpleInformation from "@views/widgets/banners/simpleInformation";
import React, { useEffect } from "react";

const WidgetsBanners: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Banners | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Banners" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <CustomerSupport />
        <SimpleInformation />
        <BookAppointment />
      </div>
    </React.Fragment>
  );
};

export default WidgetsBanners;
