import React, { useEffect } from "react";
import UserProjectsContent from "./userProjects";
import { NextPageWithLayout } from "@dtos/layout";
import UserProfileHeader from "@src/components/common/userProfileHeader";

const UserProjects: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Projects | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* user profile header */}
      <UserProfileHeader />
      {/* user profile overview content */}
      <UserProjectsContent />
    </React.Fragment>
  );
};
export default UserProjects;
