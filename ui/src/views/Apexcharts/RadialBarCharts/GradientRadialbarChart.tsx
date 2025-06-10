import useChartColors from "@hooks/useChartColors";
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface RadialChartsProps {
  chartColors: string;
  chartDarkColors: string;
  chartId: string | number;
}

const GradientRadialBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadialChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors });

  const series = [75];
  const labels = ["Percent"];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "radialBar",
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
        },
        track: {
          strokeWidth: "67%",
          margin: 0, // margin is in pixels
        },

        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "17px",
          },
          value: {
            formatter: function (val): any {
              return parseInt(val.toString());
            },
            color: "#111",
            fontSize: "36px",
            show: true,
          },
        },
      },
    },
    colors: chartsColor,
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#ABE5A1"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: labels,
  };

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radialBar"
        data-chart-colors="[bg-primary-500, bg-green-500]"
        id={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  );
};

export default GradientRadialBarChart;
