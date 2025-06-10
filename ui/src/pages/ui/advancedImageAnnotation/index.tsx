import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import AnnotationImage from "@views/uiAdvanced/uiAdvancedImageAnnotation/annotationImage";
import React, { useEffect } from "react";

const ImageAnnotation: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Image Annotation | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Images Annotation" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <AnnotationImage />
        </div>
      </div>
    </React.Fragment>
  );
};

export default ImageAnnotation;
