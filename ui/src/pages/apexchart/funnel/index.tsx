import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import FunnelChart from "@views/apexcharts/funnelCharts/funnelChart";
import PyramidChart from "@views/apexcharts/funnelCharts/pyramidChart";
import React, { useEffect } from "react";

const FunnelCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Funnel Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Funnel Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Funnel</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <FunnelChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId="funnelChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Pyramid</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <PyramidChart chartId="pyramidChart" />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default FunnelCharts;
