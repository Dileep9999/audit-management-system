import React, { useEffect } from "react";
import UserFollowersContent from "./userFollowers";
import { NextPageWithLayout } from "@dtos/layout";
import UserProfileHeader from "@src/components/common/userProfileHeader";

const UserFollowers: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Followers | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* Profile Header */}
      <UserProfileHeader />
      {/* profile followers content */}
      <UserFollowersContent />
    </React.Fragment>
  );
};
export default UserFollowers;
