import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface TreemapChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: any;
}

const MultipleTreepMapChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: TreemapChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    {
      name: "Desktops",
      data: [
        {
          x: "ABC",
          y: 10,
        },
        {
          x: "DEF",
          y: 60,
        },
        {
          x: "XYZ",
          y: 41,
        },
      ],
    },
    {
      name: "Mobile",
      data: [
        {
          x: "ABCD",
          y: 10,
        },
        {
          x: "DEFG",
          y: 20,
        },
        {
          x: "WXYZ",
          y: 51,
        },
        {
          x: "PQR",
          y: 30,
        },
        {
          x: "MNO",
          y: 20,
        },
        {
          x: "CDE",
          y: 30,
        },
      ],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "treemap",
    },
    colors: chartsColor,
    legend: {
      show: false,
    },
    title: {
      text: "Multi-dimensional Treemap",
      align: "center",
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="treemap"
        data-chart-colors="[bg-primary-500, bg-green-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default MultipleTreepMapChart;
