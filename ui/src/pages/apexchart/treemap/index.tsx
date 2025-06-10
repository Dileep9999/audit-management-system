import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect, useRef } from "react";
import BasicTreepMapChart from "@src/views/apexcharts/treemapCharts/basicTreepmapChart";
import MultipleTreepMapChart from "@src/views/apexcharts/treemapCharts/multipleTreepmapChart";
import ColorRangeTreeMapChart from "@src/views/apexcharts/treemapCharts/colorRangeTreemapChart";
import DistributedTreeMapChart from "@src/views/apexcharts/treemapCharts/distributedTreemapChart";

const TreemapCharts: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Treemap Charts | Domiex - React TS Admin & Dashboard Template";
  }, []);

  const basicTreepMapChart = useRef();
  const multipleTreeMapChart = useRef();
  const ColorRangeTreeMapCharts = useRef();

  return (
    <React.Fragment>
      <BreadCrumb title="Treemap Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicTreepMapChart
                chartColors="[bg-primary-500]"
                chartDarkColors={""}
                chartId={basicTreepMapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Treemap Multiple Series</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleTreepMapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={""}
                chartId={multipleTreeMapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Color Range</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ColorRangeTreeMapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={""}
                chartId={ColorRangeTreeMapCharts}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Distributed</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DistributedTreeMapChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-sky-500, bg-red-500]"
                chartDarkColors={""}
                chartId={"DistributedTreeMapCharts"}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TreemapCharts;
