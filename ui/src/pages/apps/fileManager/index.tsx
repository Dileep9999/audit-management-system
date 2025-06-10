import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { NextPageWithLayout } from "@src/dtos";
import { RootState } from "@src/slices/reducer";
import FileManagerMainSection from "@src/views/apps/filemanager/fileManagerMainSection";
import FileStorageSection from "@src/views/apps/filemanager/fileStorageSection";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const FileManagerApp: NextPageWithLayout = () => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  useEffect(() => {
    document.title =
      "File Manager | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="File Manager" subTitle="Apps" />
      <div className="grid grid-cols-12 gap-x-space">
        <FileManagerMainSection />
        <FileStorageSection />
      </div>
      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default FileManagerApp;
