// 与服务端发送或接受数据的各API接口调用函数

const BASE_URL = 'http://localhost:5500';

// 导出数据类型接口
import {
    PerformanceData,
    QueryParams,
    WhiteScreenReport,
    FlowDataParams,
    DurationData
} from '../interface';

// 通用请求函数主体
async function fetchAPI<T>(url: string, method: string, body?: object, query?: Record<string, any>): Promise<T> {
    const headers = { 'Content-Type': 'application/json' };
    const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
    const response = await fetch(`${BASE_URL}${url}${queryString}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
}

// 1. 性能数据上报
export async function pushPerformance(data: PerformanceData) {
    return fetchAPI<{ success: boolean }>('/api/push_pref', 'POST', data);
}

// 2. 获取性能数据
export async function getPerformance(params: QueryParams) {
    return fetchAPI<{ success: boolean; data: any[] }>('/api/get_pref', 'GET', undefined, params);
}

// 3. 白屏URL上报
export async function reportWhiteScreen(data: WhiteScreenReport) {
    return fetchAPI<{ success: boolean }>('/api/push/WhiteScreen', 'POST', data);
}

// 4. 白屏次数查询
export async function getWhiteScreenCount(pageUrl: string, rangeTime?: number) {
    return fetchAPI<{ success: boolean; data?: any[]; totalCount?: number }>(
        '/api/get/WhiteScreen',
        'GET',
        undefined,
        { pageUrl, rangeTime }
    );
}

// 5. 流量数据上报
export async function pushFlowData(pagePath: string, dataType: 'pv' | 'uv') {
    return fetchAPI<{ success: boolean }>('/api/push_flowData', 'POST', { pagePath, dataType });
}

// 6. 获取流量数据
export async function getFlowData(params: FlowDataParams) {
    return fetchAPI<{ success: boolean; totalCount: number }>(
        '/api/get_flowData',
        'GET',
        undefined,
        params
    );
}

// 7. 停留时长上报
export async function pushDuration(data: DurationData) {
    return fetchAPI<{ success: boolean }>('/api/pushDuration', 'POST', data);
}

// 8. 获取停留时长
export async function getDurations(pagePath: string, rangeTime?: number) {
    return fetchAPI<{ success: boolean; data: any[] }>(
        '/api/getDurations',
        'GET',
        undefined,
        { pagePath, rangeTime }
    );
}

// 9. 删除性能数据
export async function deletePerformance(timestamp: string) {
    return fetchAPI<{ success: boolean }>(`/api/performance/${timestamp}`, 'DELETE');
}

// 错误处理增强，当 Promise 被拒绝（rejected）且没有被 catch 块捕获时，会触发这个事件
window.addEventListener('unhandledrejection', event => {
    if (event.reason instanceof Error) {
        console.error('API Error:', event.reason.message);
        // 这里可以添加统一的错误处理逻辑
    }
});