import React from "react";
import ReactEcharts from "echarts-for-react";

const SingleBarChart = () => {
  const option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    grid: {
      top: "3%",
      left: "2%",
      right: "0%",
      bottom: "2%",
      containLabel: true,
    },
    series: [
      {
        data: [
          120,
          {
            value: 200,
            itemStyle: {
              color: "#a90000",
            },
          },
          150,
          80,
          70,
          110,
          130,
        ],
        type: "bar",
      },
    ],
  };

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={option} />
    </React.Fragment>
  );
};

export default SingleBarChart;
