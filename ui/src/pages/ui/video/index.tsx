import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import VideoGallery from "@views/uiElements/uiVideo/videoGallery";
import React, { useEffect } from "react";

const Videos: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Video | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Video" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <VideoGallery />
      </div>
    </React.Fragment>
  );
};

export default Videos;
