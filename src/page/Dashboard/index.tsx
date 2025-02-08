import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Spin, Alert, Tabs, Table, Button } from 'antd';

interface PerformanceData {
  timestamp: string;
  ttfb?: number;
  dnsLookupTime?: number;
  tcpConnectionTime?: number;
  resourceDuration?: number;
  whiteScreenCount?: number; // 新增字段
  [key: string]: any;
}

const PerformanceDashboard = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 删除数据库中的数据
  const handleDelete = async (timestamp: string) => {
    try {
      const response = await fetch(`http://localhost:5501/api/performance/${timestamp}`, {
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
        const response = await fetch('http://localhost:5501/api/performance?limit=100');
        if (!response.ok) throw new Error('数据获取失败');
        const result = await response.json();
        console.log('result.data', result.data);
        // 转换数据格式
        const formattedData = result.data.map((item: any) => ({
          formattedTimestamp: new Date(item.timestamp).toLocaleString(), // 新增格式化时间字段
          timestamp: item.timestamp,
          ttfb: item.ttfb,
          dnsLookupTime: item.dnsLookupTime,
          tcpConnectionTime: item.tcpConnectionTime,
          whiteScreenCount: item.whiteScreenCount
        }));
        console.log('formattedData', formattedData);
        setData(formattedData.reverse()); // 按时间升序排列
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: '时间',
      dataIndex: 'formattedTimestamp', // 使用格式化后的时间字段
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
      title: 'DNS查询',
      dataIndex: 'dnsLookupTime',
      key: 'dns',
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: 'TCP连接',
      dataIndex: 'tcpConnectionTime',
      key: 'tcp',
      render: (value: number) => value?.toFixed(2),
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
      render: (value: any, record: PerformanceData, index: number) => (
        <Button className="danger" onClick={() => handleDelete(record.timestamp)}>
          删除
        </Button>
      ),
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
                  dataKey="dnsLookupTime"
                  stroke="#82ca9d"
                  name="DNS查询 (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="tcpConnectionTime"
                  stroke="#ffc658"
                  name="TCP连接 (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="whiteScreenCount"
                  stroke="#ff7300"
                  name="白屏次数"
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
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;