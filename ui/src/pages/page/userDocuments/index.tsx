import React, { useEffect } from "react";
import UserDocumentsContent from "./userDocuments";
import { NextPageWithLayout } from "@dtos/layout";
import UserProfileHeader from "@src/components/common/userProfileHeader";

const UserDocuments: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "User Documents | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      {/* Profile Header */}
      <UserProfileHeader />
      {/* profile documents content */}
      <UserDocumentsContent />
    </React.Fragment>
  );
};
export default UserDocuments;
