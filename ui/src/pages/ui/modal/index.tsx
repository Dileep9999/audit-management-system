import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicModal from "@views/uiElements/uiModal/basicModal";
import ModalPosition from "@views/uiElements/uiModal/modalPosition";
import SizeModal from "@views/uiElements/uiModal/sizeModal";
import React, { useEffect } from "react";

const Modals: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Model | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Modal" subTitle="UI" />
      <div className="grid grid-cols-1 gap-x-space">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicModal />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Modal Position</h6>
          </div>
          <div className="card-body">
            <ModalPosition />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Size Modal</h6>
          </div>
          <div className="card-body">
            <SizeModal />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Modals;
