import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicHeatmapChart from "@views/apexcharts/heatMapCharts/basicHeatmapChart";
import MultipleColorsChart from "@views/apexcharts/heatMapCharts/multipleColorsChart";
import MultipleColorsFlippedHeatChart from "@views/apexcharts/heatMapCharts/multipleColorsFlippedHeatChart";
import RoundedHeatmapChart from "@views/apexcharts/heatMapCharts/roundedHeatmapChart";
import React, { useEffect } from "react";

const HeatmapCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Heatmap Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Heatmap Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicHeatmapChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId="basicHatMapChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Colors</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleColorsChart
                chartColors="[bg-primary-500, bg-green-500, bg-pink-500, bg-sky-500, bg-indigo-500, bg-purple-500, bg-orange-500, bg-yellow-500]"
                chartDarkColors={""}
                chartId="multiColorHatMapChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Colors Flipped</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleColorsFlippedHeatChart
                chartColors="[bg-primary-500, bg-green-500, bg-pink-500, bg-sky-500, bg-indigo-500, bg-purple-500, bg-orange-500, bg-yellow-500]"
                chartDarkColors={""}
                chartId="multiColorFlippedHatMapChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Rounded</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <RoundedHeatmapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={""}
                chartId="roundedHatMapChart"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default HeatmapCharts;
