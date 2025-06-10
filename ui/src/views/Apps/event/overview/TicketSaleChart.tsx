import React from "react";
import useChartColors from "@src/hooks/useChartColors";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface AreaChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string;
}

const TicketSaleCharts = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [{ name: "Ticket Sale", data: [10, 41, 35, 51, 49, 62, 69] }];

  const labels = ["S", "M", "T", "W", "T", "F", "S"];

  const options: ApexOptions = {
    labels: labels,
    chart: {
      defaultLocale: "en",
      height: 180,
      type: "line",
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: "monotoneCubic",
      lineCap: "butt",
      width: 3,
      dashArray: 0,
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      x: {
        show: true,
      },
    },
    colors: chartsColor,
    grid: {
      padding: {
        top: -10,
        right: 0,
        bottom: 0,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500]"
        type="line"
        id={chartId}
        height={180}
        width="100%"
      />
    </React.Fragment>
  );
};

export default TicketSaleCharts;
