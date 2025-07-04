import React from "react";
import ReactEcharts from "echarts-for-react";

const PolarLineChart = () => {
  const data = [];
  for (let i = 0; i <= 360; i++) {
    const t = (i / 180) * Math.PI;
    const r = Math.sin(2 * t) * Math.cos(2 * t);
    data.push([r, i]);
  }

  const option = {
    title: {
      text: "Two Value-Axes in Polar",
    },
    legend: {
      data: ["line"],
    },
    polar: {
      center: ["50%", "54%"],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    angleAxis: {
      type: "value",
      startAngle: 0,
    },
    radiusAxis: {
      min: 0,
    },
    series: [
      {
        coordinateSystem: "polar",
        name: "line",
        type: "line",
        showSymbol: false,
        data: data,
      },
    ],
    animationDuration: 2000,
  };
  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={option} />
    </React.Fragment>
  );
};

export default PolarLineChart;
