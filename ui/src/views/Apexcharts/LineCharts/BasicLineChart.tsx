import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface LineChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: any;
}

const BasicLineChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: LineChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const values = [10, 41, 35, 51, 49, 62, 69, 91, 148];
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatCurrency = (x: number) => {
    return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const series = [
    {
      name: "Series name",
      data: values,
    },
  ];
  const options: ApexOptions = {
    labels: labels,
    chart: {
      defaultLocale: "en",
      height: 300,
      type: "line",
      zoom: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    grid: {
      row: {
        colors: ["transparent"],
        opacity: 0.5,
      },
      padding: {
        top: 0,
        right: 5,
        bottom: 0,
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
    colors: chartsColor,
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="line"
        data-chart-colors="[bg-primary-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default BasicLineChart;
