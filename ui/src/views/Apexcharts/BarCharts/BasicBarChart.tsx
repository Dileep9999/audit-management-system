import useChartColors from "@hooks/useChartColors";
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface AreaChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const BasicBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    {
      data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "South Korea",
        "Canada",
        "United Kingdom",
        "Netherlands",
        "Italy",
        "France",
        "Japan",
        "United States",
        "China",
        "Germany",
      ],
    },
    colors: chartsColor,
    grid: {
      padding: {
        right: 0,
        bottom: -10,
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
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicBarChart;
