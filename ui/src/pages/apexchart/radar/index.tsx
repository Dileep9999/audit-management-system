import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import PolygonFillChart from "@src/views/apexcharts/radarCharts/polygonfillChart";
import BasicRadarChart from "@views/apexcharts/radarCharts/basicRadarChart";
import MultipleRadarChart from "@views/apexcharts/radarCharts/multipleRadarChart";
import React, { useEffect, useRef } from "react";

const RadarCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Radar Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  const multipleRadarChart = useRef();

  return (
    <React.Fragment>
      <BreadCrumb title="Radar Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicRadarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId="basicRadarChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radar – Multiple Series</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleRadarChart
                chartColors="[bg-primary-500, bg-yellow-500, bg-green-500]"
                chartDarkColors={""}
                chartId={multipleRadarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radar with Polygon-fill</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <PolygonFillChart
                chartColors="[bg-red-500]"
                chartDarkColors={""}
                chartId="polygonRadarChart"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default RadarCharts;
