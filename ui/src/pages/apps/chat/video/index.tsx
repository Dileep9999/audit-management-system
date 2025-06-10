import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import CallReceiver from "@src/views/apps/chat/video/callReciver";
import GroupVideoChat from "@src/views/apps/chat/video/groupChat";
import GroupVideoCall from "@src/views/apps/chat/video/groupVideoCall";
import KeyMoments from "@src/views/apps/chat/video/keyMoments";
import React, { useEffect } from "react";

const Video: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Group Video | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Group Video" subTitle="Charts" />
      <GroupVideoCall />
      <div className="grid grid-cols-12 gap-x-space">
        <CallReceiver />
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <KeyMoments />
          <GroupVideoChat />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Video;
