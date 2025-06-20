import React from "react";
import ReactEcharts from "echarts-for-react";

const CategoryLineChart = () => {
  const option = {
    legend: {
      data: ["Altitude (km) vs. temperature (°C)"],
    },
    tooltip: {
      trigger: "axis",
      formatter: "Temperature : <br/>{b}km : {c}°C",
    },
    grid: {
      left: "2%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} °C",
      },
    },
    yAxis: {
      type: "category",
      axisLine: { onZero: false },
      axisLabel: {
        formatter: "{value} km",
      },
      boundaryGap: false,
      data: ["0", "10", "20", "30", "40", "50", "60", "70", "80"],
    },
    series: [
      {
        name: "Altitude (km) vs. temperature (°C)",
        type: "line",
        symbolSize: 10,
        symbol: "circle",
        smooth: true,
        lineStyle: {
          width: 3,
          shadowColor: "rgba(0,0,0,0.3)",
          shadowBlur: 10,
          shadowOffsetY: 8,
        },
        data: [15, -50, -56.5, -46.5, -22.1, -2.5, -27.7, -55.7, -76.5],
      },
    ],
  };
  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={option} />
    </React.Fragment>
  );
};

export default CategoryLineChart;
