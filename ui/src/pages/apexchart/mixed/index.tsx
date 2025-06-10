import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";
import LineScatterChart from "@src/views/apexcharts/mixedCharts/lineScatterChart";
import LineColumnAreaChart from "@src/views/apexcharts/mixedCharts/lineColumnAreaChart";
import LineAreaChart from "@src/views/apexcharts/mixedCharts/lineAreaChart";
import LineColumnChart from "@src/views/apexcharts/mixedCharts/lineColumnChart";

const MixedCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Mixed Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Mixed Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Line Column</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineColumnChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={""}
                chartId="lineColumnChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Line & Area</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineAreaChart
                chartColors="[bg-sky-500, bg-green-500]"
                chartDarkColors={""}
                chartId="lineAreaChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Column Area</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineColumnAreaChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500]"
                chartDarkColors={""}
                chartId="lineColumnAreaChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Scatter</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineScatterChart
                chartColors="[bg-sky-500, bg-green-500]"
                chartDarkColors={""}
                chartId="lineScatterChart"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default MixedCharts;
