import useChartColors from "@hooks/useChartColors";
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface PieChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const MonochromePieChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: PieChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });
  const series = [25, 15, 44, 55, 41, 17];
  const labels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const options: ApexOptions = {
    chart: {
      height: 340,
      type: "pie",
    },
    labels: labels,
    theme: {
      monochrome: {
        enabled: true,
      },
    },
    colors: chartsColor,
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
        },
      },
    },
    title: {
      text: "Monochrome Pie",
    },
    dataLabels: {
      formatter(val: number, opts): any {
        const name = opts.w.globals.labels[opts.seriesIndex];
        return [name, val.toFixed(1) + "%"];
      },
    },
    legend: {
      show: false,
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="pie"
        data-chart-colors="[bg-yellow-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default MonochromePieChart;
