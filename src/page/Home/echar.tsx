import * as echarts from "echarts";
import React from "react";

type EChartsOption = echarts.EChartsOption;

const Mychart = React.memo(() => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);
    const option: EChartsOption = {
      title: {
        text: "Referer of a Website",
        subtext: "Fake Data",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          data: [
            { value: 1048, name: "Search Engine" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
  }, []);
  return <div ref={chartRef} style={{ width: "100wh", height: "100vh" }} />;
});

export default Mychart;
