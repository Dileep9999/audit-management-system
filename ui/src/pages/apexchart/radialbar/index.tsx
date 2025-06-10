import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";
import BasicRadialBarChart from "@src/views/apexcharts/radialBarCharts/basicRadialbarChart";
import MultipleRadialBarChart from "@src/views/apexcharts/radialBarCharts/multipleRadialbarChart";
import CustomAngleRadialBarChart from "@src/views/apexcharts/radialBarCharts/customAngleRadialbarChart";
import GradientRadialBarChart from "@src/views/apexcharts/radialBarCharts/gradientRadialbarChart";
import ImageRadialBarChart from "@src/views/apexcharts/radialBarCharts/imageRadialbarChart";
import StrokedGaugeRadialBarChart from "@src/views/apexcharts/radialBarCharts/strokedGaugeRadialbarChart";
import SemiGaugeRadialBarChart from "@src/views/apexcharts/radialBarCharts/semiGaugeRadialbarChart";

const RadialbarCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Radialbar Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Radialbar Charts" subTitle="Apex Chart" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicRadialBarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId="BasicRadialBarCharts"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleRadialBarChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500]"
                chartDarkColors={""}
                chartId="MultipleRadialBarCharts"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Custom Angle Circle</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <CustomAngleRadialBarChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500]"
                chartDarkColors={""}
                chartId="CustomAngleRadialBarCharts"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Gradient</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <GradientRadialBarChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={""}
                chartId="GradientRadialBarCharts"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radialbars with Image</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ImageRadialBarChart chartId="ImageRadialBarCharts" />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Stroked Gauge</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <StrokedGaugeRadialBarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId="StrokedGaugeRadialBarCharts"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Semi Circle Gauge</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SemiGaugeRadialBarChart
                chartColors="[bg-sky-500]"
                chartDarkColors={""}
                chartId="SemiGaugeRadialBarCharts"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default RadialbarCharts;
