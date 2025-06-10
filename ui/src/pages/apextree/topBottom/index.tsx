import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import TopBottomChart from "@views/apexTree/topBottom/topBottomChart";
import React, { useEffect } from "react";

const ApexTreeTopBottomChart: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Top to Bottom | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Top to Bottom" subTitle="Apextree" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Top to Bottom</h6>
          </div>
          <div className="card-body">
            <TopBottomChart
              chartColors="[bg-gray-200, bg-white, bg-primary-500, bg-purple-500, bg-yellow-500, bg-gray-800, bg-orange-500, bg-green-500, bg-pink-500]"
              chartDarkColors="[bg-dark-800, bg-white, bg-primary-500, bg-purple-500, bg-yellow-500, bg-dark-800, bg-orange-500, bg-green-500, bg-pink-500]"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ApexTreeTopBottomChart;
