import UserProfileHeader from "@src/components/common/userProfileHeader";
import UserProfileOverView from "@src/components/common/userProfileOverView";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";

const UserPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* profile header */}
      <UserProfileHeader />
      {/* profile overview content */}
      <UserProfileOverView />
    </React.Fragment>
  );
};
export default UserPage;
