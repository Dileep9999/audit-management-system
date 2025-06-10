import React, { useEffect } from "react";
import UserActivityContent from "./userActivity";
import { NextPageWithLayout } from "@dtos/layout";
import UserProfileHeader from "@src/components/common/userProfileHeader";

const UserActivity: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Activity | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* Profile Header */}
      <UserProfileHeader />
      {/* profile activity content */}
      <UserActivityContent />
    </React.Fragment>
  );
};
export default UserActivity;
