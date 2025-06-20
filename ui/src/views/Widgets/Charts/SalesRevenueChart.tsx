import React from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import useChartColors from "@hooks/useChartColors";

interface AreaChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const SalesRevenueApp = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    {
      name: "Total Revenue",
      data: [31, 40, 28, 51, 42, 119, 100],
    },
  ];

  const labels = ["Jan", "Feb", "March", "April", "May", "June", "July"];

  const options: ApexOptions = {
    labels: labels,
    chart: {
      defaultLocale: "en",
      height: 140,
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      curve: "smooth",
      dashArray: [10],
    },
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - <strong>" +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          "</strong>"
        );
      },
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 5,
      },
    },
    grid: {
      padding: {
        top: -20,
        right: 0,
        bottom: 0,
        left: 7,
      },
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      show: false,
    },
    colors: chartsColor,
  };

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500, bg-primary-100, bg-primary-50, bg-primary-300]"
        type="line"
        id={chartId}
        height={140}
        width="100%"
      />
    </React.Fragment>
  );
};

export default SalesRevenueApp;
