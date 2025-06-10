import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface RadialChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string | number;
}

const BasicRadialBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadialChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [70];
  const labels = ["Cricket"];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "radialBar",
    },
    colors: chartsColor,
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%",
        },
      },
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
        data-chart-colors="[bg-primary-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicRadialBarChart;
