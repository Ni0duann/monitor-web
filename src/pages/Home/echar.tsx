import * as echarts from "echarts";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFlowData, pushDuration, getDurations } from '@/api'; // 

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

// 定义今日和昨日流量数据类型
type TrafficData = {
  today: {
    pv: number;
    uv: number;
    averageDuration: string;
  };
  yesterday: {
    pv: number;
    uv: number;
    averageDuration: string;
  };
};

// 定义页面停留时长数据类型
type PageDurationData = {
  pagePath: string;
  averageDuration: string;
};

const Mychart = React.memo(() => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [pvUvData, setPvUvData] = useState<PvUvData | null>(null);
  // 页面刷新倒计时
  const [remainingTime, setRemainingTime] = useState(10);

  const location = useLocation();
  const [entryTime, setEntryTime] = useState<number | null>(null);
  const [pageDurations, setPageDurations] = useState<PageDurationData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);

  // 获取 pvuv 相关数据
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

  //向数据库获取页面停留时长数据
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


  //记录用户在子页面的停留时长
  useEffect(() => {
    // 记录用户进入页面的时间
    setEntryTime(Date.now());
    // 初始加载 pvuv 数据
    fetchPvUvData();
    fetchPageDurations();
    // 设置定时器，每隔 10 秒刷新一次数据
    const intervalId = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          fetchPvUvData();
          fetchPageDurations();
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


  //发送停留时长数据到数据库
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


//将获取到的流量数据显示在页面上
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
              <th>平均访问时长</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const percentage = ((item.pv / pvTotal) * 100).toFixed(2);
              const pageDuration = pageDurations.find(d => d.pagePath === item.page);
              const averageDuration = pageDuration ? pageDuration.averageDuration : 'N/A';
              return (
                <tr key={index}>
                  <td>{item.page}</td>
                  <td>{item.pv.toLocaleString()}</td>
                  <td>{percentage}%</td>
                  <td>{averageDuration}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    return null;
  };

  const renderTrafficTable = () => {
    if (trafficData) {
      const { today, yesterday } = trafficData;
      return (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>浏览量(PV)</th>
              <th>访客数(UV)</th>
              <th>总平均访问时长</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>今日</td>
              <td>{today.pv.toLocaleString()}</td>
              <td>{today.uv.toLocaleString()}</td>
              <td>{today.averageDuration}</td>
            </tr>
            <tr>
              <td>昨日</td>
              <td>{yesterday.pv.toLocaleString()}</td>
              <td>{yesterday.uv.toLocaleString()}</td>
              <td>{yesterday.averageDuration}</td>
            </tr>
          </tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <div>
      <h2>今日流量</h2>
      {renderTrafficTable()}
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