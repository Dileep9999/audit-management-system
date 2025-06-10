import React from "react";
import useChartColors from "@src/hooks/useChartColors";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface AreaChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const WorkingHoursChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [
    {
      name: "Hours",
      data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 16, 2, 7, 8],
    },
  ];

  const options: ApexOptions = {
    chart: {
      defaultLocale: "en",
      height: 300,
      type: "line",
      zoom: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        enabledOnSeries: undefined,
        top: 0,
        left: 0,
        blur: 3,
        color: "#000",
        opacity: 0.15,
      },
    },
    stroke: {
      width: 5,
      curve: "smooth",
    },
    xaxis: {
      type: "datetime",
      categories: [
        "1/11/2024",
        "2/11/2024",
        "3/11/2024",
        "4/11/2024",
        "5/11/2024",
        "6/11/2024",
        "7/11/2024",
        "8/11/2024",
        "9/11/2024",
        "10/11/2024",
        "11/11/2024",
        "12/11/2024",
        "1/11/2025",
        "2/11/2025",
        "3/11/2025",
        "4/11/2025",
        "5/11/2025",
        "6/11/2025",
      ],
      tickAmount: 10,
      labels: {
        formatter: function (timestamp: string, _, opts) {
          return opts.dateFormatter(new Date(timestamp), "dd MMM");
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: [chartsColor[1]],
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100],
      },
    },
    grid: {
      padding: {
        top: 0,
        right: 5,
        bottom: 0,
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
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
        data-chart-colors="[bg-purple-500, bg-primary-500]"
        type="line"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default WorkingHoursChart;
