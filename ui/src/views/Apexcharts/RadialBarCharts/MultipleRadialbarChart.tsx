import React from "react";
import { ApexOptions } from "apexcharts";
import useChartColors from "@hooks/useChartColors";
import ReactApexChart from "react-apexcharts";

interface RadialChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string | number;
}

const MultipleRadialBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadialChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [44, 55, 67, 83];
  const labels = ["Apples", "Oranges", "Bananas", "Berries"];
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: "16px",
          },
          total: {
            show: true,
            label: "Total",
            formatter: function (): any {
              return 249;
            },
          },
        },
      },
    },
    colors: chartsColor,
    labels: labels,
  };

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radialBar"
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default MultipleRadialBarChart;
