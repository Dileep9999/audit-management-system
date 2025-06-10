import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";
import YellowSimpleBar from "@src/views/uiAdvanced/uiSimplebar/yellowSimplebar";
import DefualtSimpleBar from "@src/views/uiAdvanced/uiSimplebar/defualtSimplebar";
import PrimarySimpleBar from "@src/views/uiAdvanced/uiSimplebar/primarySimplebar";
import GreenSimpleBar from "@src/views/uiAdvanced/uiSimplebar/greenSimplebar";
import PurpleSimpleBar from "@src/views/uiAdvanced/uiSimplebar/purpleSimplebar";
import RedSimpleBar from "@src/views/uiAdvanced/uiSimplebar/redSimplebar";
import SkySimpleBar from "@src/views/uiAdvanced/uiSimplebar/skySimplebar";
import PinkSimplebar from "@src/views/uiAdvanced/uiSimplebar/pinkSimplebar";

const SimpleBar: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Simplebar | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Simplebar" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Defualt Simplebar</h6>
          </div>
          <div className="card-body">
            <DefualtSimpleBar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Primary Simplebar</h6>
          </div>
          <div className="card-body">
            <PrimarySimpleBar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Green Simplebar</h6>
          </div>
          <div className="card-body">
            <GreenSimpleBar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Purple Simplebar</h6>
          </div>
          <div className="card-body">
            <PurpleSimpleBar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Yellow Simplebar</h6>
          </div>
          <div className="card-body">
            <YellowSimpleBar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Red Simplebar</h6>
          </div>
          <div className="card-body">
            <RedSimpleBar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Sky Simplebar</h6>
          </div>
          <div className="card-body">
            <SkySimpleBar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Pink Simplebar</h6>
          </div>
          <div className="card-body">
            <PinkSimplebar />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SimpleBar;
