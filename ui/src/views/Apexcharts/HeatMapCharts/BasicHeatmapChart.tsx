import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface HeatmapChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string | number;
}

const generateData = (count: number, yrange: { max: number; min: number }) => {
  const series = [];
  for (let i = 0; i < count; i++) {
    const x = (i + 1).toString();
    const y =
      Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

    series.push({
      x: x,
      y: y,
    });
  }
  return series;
};

const BasicHeatmapChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: HeatmapChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    { name: "Metric1", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric2", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric3", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric4", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric5", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric6", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric7", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric8", data: generateData(18, { min: 0, max: 90 }) },
    { name: "Metric9", data: generateData(18, { min: 0, max: 90 }) },
  ];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "heatmap",
    },
    dataLabels: {
      enabled: false,
    },
    colors: chartsColor,
    title: {
      text: "HeatMap Chart (Single color)",
    },
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
      },
    },
  };

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500]"
        type="heatmap"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicHeatmapChart;
