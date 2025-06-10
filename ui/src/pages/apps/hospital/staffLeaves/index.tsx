import { useEffect } from "react";
import type { NextPageWithLayout } from "@src/dtos";
import BreadCrumb from "@src/components/common/breadCrumb";
import LeavesList from "@src/views/apps/hospital/staffLleaves/leavesList";

const ParentComponent: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Leave Management | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <div>
      <BreadCrumb title="Leave Management" subTitle="Staff" />
      <LeavesList />
    </div>
  );
};

export default ParentComponent;
