import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface ColumnChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const BasicColumnChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: ColumnChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    {
      name: "Net Profit",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
    {
      name: "Revenue",
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
    {
      name: "Free Cash Flow",
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
    },
  ];
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "bar",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        // endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    colors: chartsColor,
    xaxis: {
      categories: [
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      ],
    },
    yaxis: {
      title: {
        text: "$ (thousands)",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + " thousands";
        },
      },
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="bar"
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicColumnChart;
