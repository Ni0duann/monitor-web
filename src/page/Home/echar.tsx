import * as echarts from "echarts";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type EChartsOption = echarts.EChartsOption;

// 定义 PvUvData 类型
type PvUvData = {
  pv1: number;
  uv1: number;
  pv2: number;
  uv2: number;
  pv3: number;
  uv3: number;
  pvTotal: number;
  uvTotal: number;
};

const Mychart = React.memo(() => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [pvUvData, setPvUvData] = useState<PvUvData | null>(null);
  //页面刷新倒计时
  const [remainingTime, setRemainingTime] = useState(10);
  
  const location = useLocation();
  const [entryTime, setEntryTime] = useState<number | null>(null);
  const [pageDurations, setPageDurations] = useState<PageDurationData[]>([]);

  //获取pvuv相关数据
  const fetchPvUvData = async () => {
    try {
      const response = await fetch('http://localhost:5501/api/get-pv-uv');
      const data = await response.json();
      if (data.success) {
        setPvUvData(data.data);
      }
    } catch (error) {
      console.error('获取 pv/uv 数据失败:', error);
    }
  };

  const fetchPageDurations = async () => {
    try {
      const response = await fetch('http://localhost:5501/api/get-page-durations');
      const data = await response.json();
      if (data.success) {
        setPageDurations(data.data);
      }
    } catch (error) {
      console.error('获取页面停留时长数据失败:', error);
    }
  };


  useEffect(() => {
    // 记录用户进入页面的时间
    setEntryTime(Date.now());
    // 初始加载pvuv数据
    fetchPvUvData();
    // 设置定时器，每隔 10 秒刷新一次数据
    const intervalId = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          fetchPvUvData();
          return 10;
        }
      });
    }, 1000);
    // 组件卸载时清除定时器
    return () => {
      clearInterval(intervalId);
      if (entryTime) {
        const exitTime = Date.now();
        const duration = exitTime - entryTime;
        sendDurationData(location.pathname, duration);
      }
    };
  }, [location.pathname, entryTime]);

  const sendDurationData = async (pagePath: string, duration: number) => {
    try {
      await fetch('http://localhost:5501/api/report-duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pagePath,
          duration
        })
      });
    } catch (error) {
      console.error('发送停留时长数据失败:', error);
    }
  };


  useEffect(() => {
    if (pvUvData) {
      const { pv1, pv2, pv3, pvTotal, uvTotal } = pvUvData;

      const chartDom = chartRef.current;
      const myChart = echarts.init(chartDom);
      const option: EChartsOption = {
        title: {
          text: "总 PV 和 UV 统计",
          subtext: "实时数据",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          data: ["总 PV", "总 UV"],
          orient: "vertical",
          left: "left",
        },
        xAxis: {
          type: "category",
          data: ["统计"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "总 PV",
            type: "line",
            data: [pvTotal],
          },
          {
            name: "总 UV",
            type: "line",
            data: [uvTotal],
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }
    }
  }, [pvUvData]);

  const renderTable = () => {
    if (pvUvData) {
      const { pv1, pv2, pv3, pvTotal } = pvUvData;
      const data = [
        { page: "http://localhost:5173/Page1", pv: pv1 },
        { page: "http://localhost:5173/Page2", pv: pv2 },
        { page: "http://localhost:5173/Page3", pv: pv3 },
      ];

      // 按 PV 降序排序
      data.sort((a, b) => b.pv - a.pv);

      return (
        <table>
          <thead>
            <tr>
              <th>入口页面</th>
              <th>浏览量(PV)</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const percentage = ((item.pv / pvTotal) * 100).toFixed(2);
              return (
                <tr key={index}>
                  <td>{item.page}</td>
                  <td>{item.pv.toLocaleString()}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <div>
      <div ref={chartRef} style={{ width: "100%", height: "50vh" }} />
      <h2>Top3 入口页面</h2>
      {renderTable()}
      <p>
        <span style={{ color: 'red' }}>{remainingTime}</span> 秒后数据将会自动更新，您也可以刷新页面以手动更新获取最新数据。
      </p>
    </div>
  );
});

export default Mychart;