import React, { useEffect, useState, useRef } from "react";
import { DatePicker, Select, Button, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';

import { baseUrl, pageLIst, osOptions, browserOptions, deviceTypeOptions } from "@/config/webConfig";
import FlowDataFetcher from '@/utils/getFlowData';
import { getDurations, getFlowData } from '@/api';
import './index.scss';

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

// 定义页面停留时长数据类型
type PageDurationData = {
  pagePath: string;
  averageDuration: string;
};

// 定义 flowDataList 中元素的类型
type FilteredPvUvData = {
  pv: number;
  uv: number;
};

const Mychart = React.memo(() => {
  const { RangePicker } = DatePicker;
  const { Option } = Select;

  const chartRef = useRef<HTMLDivElement>(null);
  const pvChartRef = useRef<HTMLDivElement>(null);
  // 页面刷新倒计时
  const [remainingTime, setRemainingTime] = useState(60);
  const [pageDurations, setPageDurations] = useState<PageDurationData[]>([]);
  const [flowData, setFlowData] = useState<pvuvList | null>(null);
  // 修改状态类型
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedOs, setSelectedOs] = useState('Windows');
  const [selectedBrowser, setSelectedBrowser] = useState('Chrome');
  const [selectedDeviceType, setSelectedDeviceType] = useState('Desktop');
  const [flowDataList, setflowDataList] = useState<FilteredPvUvData[]>([]);
  // 控制显示筛选的 pvuv 文本
  const [displayText, setDisplayText] = useState('');
  // 存储不同时间的 PV 数据
  const [pvData, setPvData] = useState<number[]>([]);
  // 存储日期标签
  const [dateLabels, setDateLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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

        // 获取默认时间范围的 PV 数据
        const defaultStart = dayjs().subtract(6, 'day').startOf('day');
        const defaultEnd = dayjs().endOf('day');
        const defaultDateRange = [defaultStart, defaultEnd];
        await fetchPvData(defaultDateRange);

      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };
    fetchData();
  }, []);

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null, _dateStrings: [string, string] | null) => {
    setSelectedDateRange(dates);
  };

  const handleOsChange = (value: string) => {
    setSelectedOs(value);
  };

  const handleBrowserChange = (value: string) => {
    setSelectedBrowser(value);
  };

  const handleDeviceTypeChange = (value: string) => {
    setSelectedDeviceType(value);
  };

  const handleSearch = async () => {
    let startTime = null;
    let endTime = null;
    if (selectedDateRange) {
      startTime = selectedDateRange[0].startOf('day').format('YYYY/MM/DD HH:mm:ss');
      endTime = selectedDateRange[1].endOf('day').format('YYYY/MM/DD HH:mm:ss');
    }

    try {
      const responsePv = await getFlowData({
        pagePath: 'total',
        dataType: 'pv',
        os: selectedOs,
        device_type: selectedDeviceType,
        browser: selectedBrowser,
        startTime,
        endTime,
      });
      let filterPv = responsePv.totalCount;

      const responseUv = await getFlowData({
        pagePath: 'total',
        dataType: 'uv',
        os: selectedOs,
        device_type: selectedDeviceType,
        browser: selectedBrowser,
        startTime,
        endTime,
      });
      let filterUv = responseUv.totalCount;

      // 将 pp 和 cc 添加到 flowDataList 数组中
      setflowDataList([...flowDataList, { pv: filterPv, uv: filterUv }]);
      // 处理数据为 0、空或 undefined 的情况
      const pvToDisplay = filterPv || 0;
      const uvToDisplay = filterUv || 0;

      // 更新显示文本
      setDisplayText(`所选条件PV人数为：${pvToDisplay}，UV人数为：${uvToDisplay}`);

      // 获取所选时间范围的 PV 数据
      if (selectedDateRange) {
        await fetchPvData(selectedDateRange);
      }
    } catch (error) {
      console.error('获取 UV 数据失败:', error);
    }
  };

  const fetchPvData = async (dateRange: [Dayjs, Dayjs]) => {
    const start = dateRange[0].startOf('day');
    const end = dateRange[1].endOf('day');
    const days = end.diff(start, 'day') + 1;
    const newPvData: number[] = [];
    const newDateLabels: string[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = start.add(i, 'day');
      const startTime = currentDate.startOf('day').format('YYYY/MM/DD HH:mm:ss');
      const endTime = currentDate.endOf('day').format('YYYY/MM/DD HH:mm:ss');

      try {
        const response = await getFlowData({
          pagePath: 'total',
          dataType: 'pv',
          os: selectedOs,
          device_type: selectedDeviceType,
          browser: selectedBrowser,
          startTime,
          endTime,
        });
        newPvData.push(response.totalCount);
        newDateLabels.push(currentDate.format('YYYY/MM/DD'));
      } catch (error) {
        console.error('获取 PV 数据失败:', error);
      }
    }

    setPvData(newPvData);
    setDateLabels(newDateLabels);
  };

  useEffect(() => {
    if (pvChartRef.current && pvData.length > 0 && dateLabels.length > 0) {
      const myChart = echarts.init(pvChartRef.current);
      const option = {
        xAxis: {
          type: 'category',
          data: dateLabels,
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: pvData,
          type: 'line',
        }],
      };
      myChart.setOption(option);

      return () => {
        myChart.dispose();
      };
    }
  }, [pvData, dateLabels]);

  // 将获取到的流量数据显示在页面上
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
              <th>平均访问时长(s)</th>
            </tr>
          </thead>
          <tbody>
            {showData.map((item, index) => {
              const percentage = ((item.pv / flowData.pvTotal) * 100).toFixed(2);
              const pageDuration = pageDurations.find(d => d.pagePath === item.page);
              let averageDuration = pageDuration ? pageDuration.averageDuration : 'N/A';
              parseFloat(averageDuration);
              averageDuration = (+averageDuration / 1000).toFixed(2);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (remainingTime > 0) {
        setRemainingTime(remainingTime - 1);
      } else {
        // 当倒计时为 0 时，重新加载页面
        window.location.reload();
      }
    }, 1000);

    return () => {
      // 组件卸载时清除定时器
      clearInterval(intervalId);
    };
  }, [remainingTime]);

  return (
    <div className={'container'}>
      <h2>流量数据</h2>
      {flowData && (
        <table>
          <thead>
            <tr>
              <th colSpan="2">过去一周</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>浏览量(PV)</td>
              <td>访客数(UV)</td>
            </tr>
            <tr>
              <td>{flowData.pvTotal.toLocaleString()}</td>
              <td>{flowData.uvTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      )}
      {/* 绘制总 PV 的折线图 */}
      <div ref={pvChartRef} style={{ width: '100%', height: '400px' }}></div>

      <div className={'filters'} ref={chartRef}  />
      <h2>Top3 入口页面</h2>
      {renderTable()}
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={handleDateRangeChange}
          format="YYYY/MM/DD"
          disabledDate={(current) => current && current > dayjs().endOf('day')}
        />
        <Select
          value={selectedOs}
          onChange={handleOsChange}
          style={{ width: 120 }}
        >
          {osOptions.map((os) => (
            <Option key={os} value={os}>
              {os}
            </Option>
          ))}
        </Select>
        <Select
          value={selectedBrowser}
          onChange={handleBrowserChange}
          style={{ width: 120 }}
        >
          {browserOptions.map((browser) => (
            <Option key={browser} value={browser}>
              {browser}
            </Option>
          ))}
        </Select>
        <Select
          value={selectedDeviceType}
          onChange={handleDeviceTypeChange}
          style={{ width: 120 }}
        >
          {deviceTypeOptions.map((deviceType) => (
            <Option key={deviceType} value={deviceType}>
              {deviceType}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleSearch}>
          确定
        </Button>
      </Space>
      {/* 显示所选条件下的 PV 和 UV 人数 */}
      {displayText && <p>{displayText}</p>}

      <div className={'countdown'}>
        <p>
          <span style={{ color: 'red' }}>{remainingTime}</span> 秒后数据将会自动更新，您也可以刷新页面以手动更新获取最新数据。
        </p>
      </div>

    </div>
  );
});

export default Mychart;