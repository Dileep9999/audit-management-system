import UserProfileHeader from "@src/components/common/userProfileHeader";
import UserProfileOverView from "@src/components/common/userProfileOverView";
import { NextPageWithLayout } from "@src/dtos";
import React, { useEffect } from "react";

const User: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserProfileOverView />
    </React.Fragment>
  );
};

export default User;
