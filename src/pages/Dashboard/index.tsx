import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Spin, Alert, Tabs, Table, Button } from 'antd';
// 导入 API 接口函数
import { getPerformance, deletePerformance,getWhiteScreenCount } from '@/api';
import { baseUrl } from '@/config/webConfig';

import './index.scss'; 

interface PerformanceData {
  timestamp: string;
  formattedTimestamp: string;
  ttfb?: number;
  lcp_render_time?: number; // 修改为和后端一致的字段名
  fcp_start_time?: number; // 修改为和后端一致的字段名
  redirect_count?: number;
  // whiteScreenCount?: number;
  [key: string]: number | string | undefined;
}

interface WhiteScreenData {
  whiteScreenUrl: string;
  whiteScreenCount: number;
}

const PerformanceDashboard = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whiteScreenData, setWhiteScreenData] = useState<WhiteScreenData[]>([]);

  // 删除数据库中的性能监控数据
  const handleDelete = async (timestamp: string) => {
    try {
      const response = await fetch(`http://localhost:5500/api/delete_pref/${timestamp}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('删除失败');
      setData(data.filter(item => item.timestamp !== timestamp));
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 调用 getPerformance 函数获取性能数据
        const { success, data: resultData } = await getPerformance({ limit: 100 });
        if (!success) throw new Error('数据获取失败');
        console.log('result.data', resultData);
        // 转换数据格式： 按时间戳合并数据
        const mergedData: { [key: string]: PerformanceData } = {};
        //将时间戳转化为更直观的形式
        resultData.forEach((item: any) => {
          const timestamp = item._time;
          if (!mergedData[timestamp]) {
            mergedData[timestamp] = {
              timestamp,
              formattedTimestamp: new Date(timestamp).toLocaleString(),
            };
          }

          // 根据字段名填充数据
          const field = item._field;
          const value = item._value;
          // 类型断言确保类型安全
          (mergedData[timestamp] as Record<string, number | string | undefined>)[field] = value;
        });

        // 转换为数组并按时间排序
        const formattedData = Object.values(mergedData).sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    async function fetchWhiteScreenData () {
      try {
        // 定义 pageUrl
        const pageUrl = '/White';
        const { success, data: whiteScreenResult = [] } = await getWhiteScreenCount(pageUrl,7);
        if (!success) throw new Error('白屏数据获取失败');
        const formattedWhiteScreenData: WhiteScreenData[] = whiteScreenResult.map((item: any) => ({
          whiteScreenUrl: baseUrl +item.pageUrl,
          whiteScreenCount: item._value,
        }));
        setWhiteScreenData(formattedWhiteScreenData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      }
    };

    fetchData();
    fetchWhiteScreenData();
  }, []);

  const columns = [
    {
      title: '时间',
      dataIndex: 'formattedTimestamp',
      key: 'formattedTimestamp',
      width: 200,
    },
    {
      title: 'TTFB (ms)',
      dataIndex: 'ttfb',
      key: 'ttfb',
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: 'LCP(ms)',
      dataIndex: 'lcp_render_time', // 修改为和后端一致的字段名
      key: 'lcp_render_time',
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: 'FCP(ms)',
      dataIndex: 'fcp_start_time', // 修改为和后端一致的字段名
      key: 'fcp_start_time',
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: '重定向次数',
      dataIndex: 'redirect_count',
      key: 'redirect_count',
      render: (value: number) => value || 0,
    },
    {
      title: '白屏次数',
      dataIndex: 'whiteScreenCount',
      key: 'whiteScreen',
      render: (value: number) => value || 0,
    },
    {
      title: '操作',
      key: 'action',
      // 明确参数类型
      render: (record: PerformanceData) => (
        <Button className="danger" onClick={() => handleDelete(record.timestamp)}>
          删除
        </Button>
      ),
    },
  ];

  const whiteScreenColumns = [
    {
      title: '白屏URL',
      dataIndex: 'whiteScreenUrl',
      key: 'whiteScreenUrl',
    },
    {
      title: '白屏次数',
      dataIndex: 'whiteScreenCount',
      key: 'whiteScreenCount',
    },
  ];

  if (loading) return <Spin tip="加载性能数据..." size="large" />;
  if (error) return <Alert message="错误" description={error} type="error" showIcon />;
  return (
    <div style={{ padding: 20 }}>
      <h1>性能监控仪表盘</h1>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="趋势图表" key="1">
          <div style={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedTimestamp"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(data.length / 5)}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ttfb"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="TTFB (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="lcp_render_time" // 修改为和后端一致的字段名
                  stroke="#82ca9d"
                  name="LCP(ms)"
                />
                <Line
                  type="monotone"
                  dataKey="fcp_start_time" // 修改为和后端一致的字段名
                  stroke="#ffc658"
                  name="FCP(ms)"
                />
                <Line
                  type="monotone"
                  dataKey="whiteScreenCount"
                  stroke="#ff7300"
                  name="白屏次数"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="redirect_count"
                  stroke="#ff0000"
                  name="重定向次数"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="原始数据" key="2">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
            rowKey="timestamp"
            scroll={{ x: 800 }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="白屏监控" key="3">
          <Table
            columns={whiteScreenColumns}
            dataSource={whiteScreenData}
            pagination={{ pageSize: 10 }}
            rowKey="whiteScreenUrl"
            scroll={{ x: 800 }}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;