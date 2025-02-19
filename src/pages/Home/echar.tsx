// import * as echarts from "echarts";
import React, { useEffect, useState } from "react";
import { baseUrl, pageLIst } from "@/config/webConfig";
import FlowDataFetcher from '@/utils/getFlowData';
import { getDurations} from '@/api';

// type EChartsOption = echarts.EChartsOption;

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
// type TrafficData = {
//   today: {
//     pv: number;
//     uv: number;
//     averageDuration: string;
//   };
//   yesterday: {
//     pv: number;
//     uv: number;
//     averageDuration: string;
//   };
// };

// 定义页面停留时长数据类型
type PageDurationData = {
  pagePath: string;
  averageDuration: string;
};

const Mychart = React.memo(() => {

  const chartRef = React.useRef<HTMLDivElement>(null);
  // 页面刷新倒计时
  const [remainingTime, setRemainingTime] = useState(30);
  const [pageDurations, setPageDurations] = useState<PageDurationData[]>([]);

  const [flowData, setFlowData] = useState<pvuvList | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('开始获取数据');
      try {
        const fetcher = new FlowDataFetcher();
        const allFlowData = await fetcher.fetchAll(7);
        console.log('获取到的数据:', allFlowData);
        setFlowData(allFlowData);

        // 获取每个页面的平均访问时长
        const durationPromises = pageLIst.map(async (page) => {
          const { success, data } = await getDurations(page, 7);
          if (success && data.length > 0) {
            const averageDuration = data[0]._value.toFixed(2);
            return { pagePath: page, averageDuration };
          }
          return { pagePath: page, averageDuration: 'N/A' };
        });

        const durations = await Promise.all(durationPromises);
        setPageDurations(durations);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  //将获取到的流量数据显示在页面上
  const renderTable = () => {
    if (flowData) {
   
      const showData = [
        { page: pageLIst[0], pv: flowData.pv1 },
        { page: pageLIst[1], pv: flowData.pv2 },
        { page: pageLIst[2], pv: flowData.pv3 },
      ];

      // 按 PV 降序排序
      showData.sort((a, b) => b.pv - a.pv);

      return (
        <table>
          <thead>
            <tr>
              <th>入口页面</th>
              <th>过去七天浏览量(PV)</th>
              <th>占比</th>
              <th>平均访问时长</th>
            </tr>
          </thead>
          <tbody>
            {showData.map((item, index) => {
              const percentage = ((item.pv / flowData.pvTotal) * 100).toFixed(2);
              const pageDuration = pageDurations.find(d => d.pagePath === item.page);
              const averageDuration = pageDuration ? pageDuration.averageDuration : 'N/A';
              return (
                <tr key={index}>
                  <td>{baseUrl + item.page}</td>
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

  return (
    <div>
      <h2>今日流量</h2>
      {flowData && (
        <p>
          过去 7 天总的 PV 为 {flowData.pvTotal.toLocaleString()}，过去 7 天总的 UV 为 {flowData.uvTotal.toLocaleString()}
        </p>
      )}
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