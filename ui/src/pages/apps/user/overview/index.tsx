import BreadCrumb from "@src/components/common/breadCrumb";
import UserProfileHeader from "@src/components/common/userProfileHeader";
import UserProfileOverView from "@src/components/common/userProfileOverView";
import { NextPageWithLayout } from "@src/dtos";
import React, { useEffect } from "react";

const OverView: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="User" />

      {/* user profile header */}
      <UserProfileHeader />

      {/* user profile */}
      <UserProfileOverView />
    </React.Fragment>
  );
};

export default OverView;
