import React, { useEffect } from "react";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import FolderStructureTree from "@views/uiAdvanced/uIAdvancedTree/advanceTree";

const Tree: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Tree | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Tree" subTitle="UI Advanced" />
      <FolderStructureTree />
    </React.Fragment>
  );
};

export default Tree;
