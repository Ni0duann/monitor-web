import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Spin, Alert, Tabs, Table, Button } from 'antd';
// 导入 API 接口函数
import { getPerformance, deletePerformance } from '@/api'; 


interface PerformanceData {
  timestamp: string;
  formattedTimestamp: string;
  ttfb?: number;
  lcpStartTime?: number;
  fcpStartTime?: number;
  whiteScreenCount?: number; // 新增字段
  [key: string]: number | string | undefined;
}

const PerformanceDashboard = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // // 删除数据库中的数据
  // const handleDelete = async (timestamp: string) => {
  //   try {
  //     const response = await fetch(`http://localhost:5501/api/delete_pref/${timestamp}`, {
  //       method: 'DELETE',
  //     });
  //     if (!response.ok) throw new Error('删除失败');
  //     setData(data.filter(item => item.timestamp !== timestamp));
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : '未知错误');
  //   }
  // };

  // 删除数据库中的数据
  const handleDelete = async (timestamp: string) => {
    try {
      // 调用 deletePerformance 函数删除数据
      const { success } = await deletePerformance(timestamp);
      if (success) {
        setData(data.filter(item => item.timestamp !== timestamp));
      } else {
        throw new Error('删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('http://localhost:5501/api/get_pref?limit=100');
        // if (!response.ok) throw new Error('数据获取失败');
        // const result = await response.json();
        // console.log('result.data', result.data);
        // // 转换数据格式： 按时间戳合并数据
        // const mergedData: { [key: string]: PerformanceData } = {};

        // result.data.forEach((item: any) => {
        //   const timestamp = item.timestamp;
        //   if (!mergedData[timestamp]) {
        //     mergedData[timestamp] = {
        //       timestamp,
        //       formattedTimestamp: new Date(timestamp).toLocaleString(),
        //     };
        //   }

        // 调用 getPerformance 函数获取性能数据
        const { success, data: resultData } = await getPerformance({ limit: 100 });
        if (!success) throw new Error('数据获取失败');
        console.log('result.data', resultData);
        // 转换数据格式： 按时间戳合并数据
        const mergedData: { [key: string]: PerformanceData } = {};

        resultData.forEach((item: any) => {
          const timestamp = item.timestamp;
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
          // switch (item.field) {
          //   case 'ttfb':
          //     mergedData[timestamp].ttfb = item.value;
          //     break;
          //   case 'lcp_render_time':
          //     mergedData[timestamp].lcpStartTime = item.value;
          //     break;
          //   case 'fcp_start_time':
          //     mergedData[timestamp].fcpStartTime = item.value;
          //     break;
          //   case 'count':
          //     if (item.type === 'white_screen') {
          //       mergedData[timestamp].whiteScreenCount = item.value;
          //     }
          //     break;
          // }
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
      title: 'LCP(ms)',
      dataIndex: 'lcp_render_time',
      key: 'lcp_render_time',
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: 'FCP(ms)',
      dataIndex: 'fcp_start_time',
      key: 'fcp_start_time',
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
      render: ( record: PerformanceData) => (
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
                  dataKey="lcpStartTime"
                  stroke="#82ca9d"
                  name="LCP(ms)"
                />
                <Line
                  type="monotone"
                  dataKey="fcpStartTime"
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