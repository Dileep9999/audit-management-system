import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import HighlightCode from "@views/uiAdvanced/uIAdvancedHighlightCode/highlightCode";
import React, { useEffect } from "react";

const Highlight: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Highlight Code | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Highlight Code" subTitle="UI Advanced" />
      <HighlightCode />
    </React.Fragment>
  );
};

export default Highlight;
