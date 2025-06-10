import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface PolarChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string | number;
}

const BasicPolarAreaChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: PolarChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [14, 23, 21, 17, 15, 10, 12, 17, 21];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "polarArea",
    },
    stroke: {
      colors: ["#fff"],
    },
    fill: {
      opacity: 0.8,
    },
    colors: chartsColor,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500, bg-red-500]"
        type="polarArea"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicPolarAreaChart;
