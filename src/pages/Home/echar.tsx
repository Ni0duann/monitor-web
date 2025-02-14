import * as echarts from "echarts";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import { getFlowData, pushDuration, getDurations } from '@/api'; // 
// import { FlowDataParams, DurationData }from '@/interface'
import  FlowDataFetcher  from '@/utils/getFlowData'

type EChartsOption = echarts.EChartsOption;

type pvuvList = {
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
  const location = useLocation();
  const chartRef = React.useRef<HTMLDivElement>(null);

  // 页面刷新倒计时
  const [remainingTime, setRemainingTime] = useState(30);

  const [entryTime, setEntryTime] = useState<number | null>(null);
  const [pageDurations, setPageDurations] = useState<PageDurationData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [flowData, setFlowData] = useState<pvuvList | null>(null);



  useEffect(() => {
    const fetchData = async () => {
      console.log('开始获取数据');
      try {
        const fetcher = new FlowDataFetcher();
        const allFlowData = await fetcher.fetchAll(7);
        console.log('获取到的数据:', allFlowData);
        setFlowData(allFlowData);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData(); // ✅ 在 useEffect 内调用
  }, []); // 空依赖数组表示仅在组件挂载时执行


//将获取到的流量数据显示在页面上
  const renderTable = () => {
    if (flowData) {
      const pvTotal = flowData.pvTotal;
      const showData = [
        { page: "http://localhost:5173/page1", pv:  flowData.pv1 },
        { page: "http://localhost:5173/page2", pv: flowData.pv2 },
        { page: "http://localhost:5173/page3", pv: flowData.pv3 },
      ];

      // 按 PV 降序排序
      showData.sort((a, b) => b.pv - a.pv);

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
            {showData.map((item, index) => {
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
      // const { today, yesterday } = trafficData;
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
              {/* <td>{today.pv.toLocaleString()}</td>
              <td>{today.uv.toLocaleString()}</td> */}
              {/* <td>{today.averageDuration}</td> */}
            </tr>
            <tr>
              <td>昨日</td>
              {/* <td>{yesterday.pv.toLocaleString()}</td>
              <td>{yesterday.uv.toLocaleString()}</td> */}
              {/* <td>{yesterday.averageDuration}</td> */}
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