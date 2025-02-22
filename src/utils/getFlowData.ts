import { getFlowData } from '@/api';
import { FlowDataParams } from '@/interface';
import { pageLIst } from '@/config/webConfig';

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

class FlowDataFetcher {
    private pagePaths: string[] = [...pageLIst, 'total'];

    async fetchAll(rangeTime?: number): Promise<PvUvData> {
        const result: PvUvData = {
            pv1: 0,
            uv1: 0,
            pv2: 0,
            uv2: 0,
            pv3: 0,
            uv3: 0,
            pvTotal: 0,
            uvTotal: 0
        };

        // 先请求所有 pagePath 的 PV 数据
        for (const pagePath of this.pagePaths) {
            const params: FlowDataParams = {
                pagePath,
                dataType: 'pv',
                rangeTime
            };

            try {
                const response = await getFlowData(params);
                if (response.success) {
                    const count = response.totalCount;
                    if (pagePath === pageLIst[0]) {
                        result.pv1 = count;
                    } else if (pagePath === pageLIst[1]) {
                        result.pv2 = count;
                    } else if (pagePath === pageLIst[2]) {
                        result.pv3 = count;
                    } else if (pagePath === 'total') {
                        result.pvTotal = count;
                    }
                }
            } catch (error) {
                console.error(`获取 ${pagePath} 的 PV 流量数据时出错:`, error);
            }
        }

        // 再请求所有 pagePath 的 UV 数据
        for (const pagePath of this.pagePaths) {
            const params: FlowDataParams = {
                pagePath,
                dataType: 'uv',
                rangeTime
            };

            try {
                const response = await getFlowData(params);
                if (response.success) {
                    const count = response.totalCount;
                    if (pagePath === pageLIst[0]) {
                        result.uv1 = count;
                    } else if (pagePath === pageLIst[1]) {
                        result.uv2 = count;
                    } else if (pagePath === pageLIst[2]) {
                        result.uv3 = count;
                    } else if (pagePath === 'total') {
                        result.uvTotal = count;
                    }
                }
            } catch (error) {
                console.error(`获取 ${pagePath} 的 UV 流量数据时出错:`, error);
            }
        }

        return result;
    }
}

export default FlowDataFetcher;