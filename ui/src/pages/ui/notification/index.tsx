import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicNotification from "@views/uiElements/uiNotification/basicNotification";
import ContentToast from "@views/uiElements/uiNotification/contentToast";
import PositionNotification from "@views/uiElements/uiNotification/positionNotification";
import React, { useEffect } from "react";

const Notifications: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Notification | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Notification" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic Notification</h6>
          </div>
          <div className="card-body">
            <BasicNotification />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Position Notification</h6>
          </div>
          <PositionNotification />
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Content Toast</h6>
          </div>
          <ContentToast />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Notifications;
