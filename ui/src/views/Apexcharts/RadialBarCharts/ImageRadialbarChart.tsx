import React from "react";
import { ApexOptions } from "apexcharts";

import user1 from "@assets/images/avatar/user-1.png";
import img1 from "../../../assets/images/gallery/img-01.jpg";
import ReactApexChart from "react-apexcharts";

interface RadialChartsProps {
  chartId: string | number;
}

const ImageRadialBarChart = ({ chartId }: RadialChartsProps) => {
  const series = [67];
  const labels = ["Volatility"];
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%",
          image: user1,
          imageWidth: 64,
          imageHeight: 64,
          imageClipped: false,
        },
        dataLabels: {
          name: {
            show: false,
            color: "#fff",
          },
          value: {
            show: true,
            color: "#333",
            offsetY: 70,
            fontSize: "22px",
          },
        },
      },
    },
    fill: {
      type: "image",
      image: {
        src: [img1],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: labels,
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radialBar"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default ImageRadialBarChart;
